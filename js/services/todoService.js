/**
 * Todo Service - Manages todo operations with smart caching
 * Provides high-level interface for todo CRUD operations
 * @param {ApiClient} apiClient - API client instance
 * @param {AppState} appState - Application state manager
 * @constructor
 */
function TodoService(apiClient, appState) {
  this.apiClient = apiClient;
  this.appState = appState;

  /**
   * Load all todos with smart caching
   * Only makes API call if todos are not already loaded
   * @param {boolean} forceReload - Force reload from API
   * @returns {Promise<Array>} Promise resolving to todos array
   */
  this.loadTodos = function (forceReload = false) {
    const state = this.appState.getState();

    // Return cached data if available and not forcing reload
    if (!forceReload && state.todos.length > 0) {
      return Promise.resolve(state.todos);
    }

    // Set loading state
    this.appState.setLoading(true);

    return this.apiClient
      .getAllTodos()
      .then((todos) => {
        // Update state with loaded todos
        this.appState.setState({
          todos: todos,
          loading: false,
          error: null,
        });

        return todos;
      })
      .catch((error) => {
        console.error("Error loading todos:", error);
        this.appState.setState({
          loading: false,
          error: "Fehler beim Laden der Todos",
        });
        throw error;
      });
  };

  /**
   * Create a new todo with optimistic updates
   * @param {Object} todoData - Todo data to create
   * @returns {Promise<Object>} Promise resolving to created todo
   */
  this.createTodo = function (todoData) {
    const tempId = Date.now(); // Temporary ID for optimistic update

    // Optimistic update - add todo to state immediately
    const optimisticTodo = {
      id: tempId,
      title: todoData.title,
      description: todoData.description,
      completed: todoData.completed || 0,
      created: Date.now(),
      updated: Date.now(),
      _pending: true, // Mark as pending
    };

    const currentTodos = this.appState.getState().todos;
    this.appState.setState({
      todos: [...currentTodos, optimisticTodo],
    });

    // Make API call
    return this.apiClient
      .createTodo(todoData)
      .then((createdTodo) => {
        // Replace optimistic todo with real todo
        const todos = this.appState.getState().todos;
        const updatedTodos = todos.map((todo) =>
          todo.id === tempId ? createdTodo : todo
        );

        this.appState.setState({
          todos: updatedTodos,
          error: null,
        });

        this.appState.addNotification({
          type: "success",
          message: "Todo erfolgreich erstellt!",
        });

        return createdTodo;
      })
      .catch((error) => {
        // Remove optimistic todo on error
        const todos = this.appState.getState().todos;
        const filteredTodos = todos.filter((todo) => todo.id !== tempId);

        this.appState.setState({
          todos: filteredTodos,
          error: "Fehler beim Erstellen des Todos",
        });

        this.appState.addNotification({
          type: "error",
          message: "Todo konnte nicht erstellt werden",
        });

        throw error;
      });
  };

  /**
   * Update a todo with optimistic updates
   * @param {number} todoId - Todo ID to update
   * @param {Object} todoData - Updated todo data
   * @returns {Promise<Object>} Promise resolving to updated todo
   */
  this.updateTodo = function (todoId, todoData) {
    // Optimistic update
    const todos = this.appState.getState().todos;
    const optimisticTodos = todos.map((todo) => {
      if (todo.id === todoId) {
        return {
          ...todo,
          ...todoData,
          updated: Date.now(),
          _pending: true,
        };
      }
      return todo;
    });

    this.appState.setState({ todos: optimisticTodos });

    // Make API call
    return this.apiClient
      .updateTodo(todoId, todoData)
      .then((updatedTodo) => {
        // Update with real data from server
        const currentTodos = this.appState.getState().todos;
        const finalTodos = currentTodos.map((todo) =>
          todo.id === todoId ? { ...updatedTodo, _pending: false } : todo
        );

        this.appState.setState({
          todos: finalTodos,
          error: null,
        });

        this.appState.addNotification({
          type: "success",
          message: "Todo erfolgreich aktualisiert!",
        });

        return updatedTodo;
      })
      .catch((error) => {
        // Revert optimistic update on error
        this.loadTodos(true); // Force reload from server

        this.appState.setError("Fehler beim Aktualisieren des Todos");
        this.appState.addNotification({
          type: "error",
          message: "Todo konnte nicht aktualisiert werden",
        });

        throw error;
      });
  };

  /**
   * Delete a todo (move to trash)
   * @param {number} todoId - Todo ID to delete
   * @returns {Promise<void>} Promise resolving when todo is deleted
   */
  this.deleteTodo = function (todoId) {
    const todos = this.appState.getState().todos;
    const todoToDelete = todos.find((todo) => todo.id === todoId);

    if (!todoToDelete) {
      return Promise.reject(new Error("Todo not found"));
    }

    // Optimistic update - remove from todos, add to trash
    const remainingTodos = todos.filter((todo) => todo.id !== todoId);
    const currentTrash = this.appState.getState().trashTodos;

    this.appState.setState({
      todos: remainingTodos,
      trashTodos: [...currentTrash, { ...todoToDelete, deletedAt: Date.now() }],
    });

    // Make API call
    return this.apiClient
      .deleteTodo(todoId)
      .then(() => {
        this.appState.addNotification({
          type: "success",
          message: "Todo in Papierkorb verschoben",
        });
      })
      .catch((error) => {
        // Revert optimistic update on error
        this.loadTodos(true); // Force reload

        this.appState.setError("Fehler beim Löschen des Todos");
        this.appState.addNotification({
          type: "error",
          message: "Todo konnte nicht gelöscht werden",
        });

        throw error;
      });
  };

  /**
   * Toggle todo completion status
   * @param {number} todoId - Todo ID to toggle
   * @returns {Promise<Object>} Promise resolving to updated todo
   */
  this.toggleTodo = function (todoId) {
    const todos = this.appState.getState().todos;
    const todo = todos.find((t) => t.id === todoId);

    if (!todo) {
      return Promise.reject(new Error("Todo not found"));
    }

    const updatedData = {
      completed: todo.completed ? 0 : 1,
    };

    return this.updateTodo(todoId, updatedData);
  };

  /**
   * Get filtered todos from state
   * @param {string} filter - Filter type: "all", "completed", "pending"
   * @returns {Array} Filtered todos array
   */
  this.getFilteredTodos = function (filter = "all") {
    const todos = this.appState.getState().todos;

    switch (filter) {
      case "completed":
        return todos.filter((todo) => todo.completed);
      case "pending":
        return todos.filter((todo) => !todo.completed);
      default:
        return todos;
    }
  };

  /**
   * Search todos by title or description
   * @param {string} searchTerm - Search term
   * @returns {Array} Matching todos
   */
  this.searchTodos = function (searchTerm) {
    const todos = this.appState.getState().todos;
    const term = searchTerm.toLowerCase();

    return todos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(term) ||
        todo.description.toLowerCase().includes(term)
    );
  };

  /**
   * Sort todos by specified criteria
   * @param {Array} todos - Todos array to sort
   * @param {string} sortBy - Sort criteria: "created", "title", "updated"
   * @param {string} direction - Sort direction: "asc", "desc"
   * @returns {Array} Sorted todos array
   */
  this.sortTodos = function (todos, sortBy = "created", direction = "desc") {
    const sortedTodos = [...todos];

    sortedTodos.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "updated":
          aVal = a.updated || a.created || 0;
          bVal = b.updated || b.created || 0;
          break;
        case "created":
        default:
          aVal = a.created || 0;
          bVal = b.created || 0;
          break;
      }

      if (direction === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sortedTodos;
  };

  /**
   * Get todo by ID from state
   * @param {number} todoId - Todo ID
   * @returns {Object|null} Todo object or null if not found
   */
  this.getTodoById = function (todoId) {
    const todos = this.appState.getState().todos;
    return todos.find((todo) => todo.id === todoId) || null;
  };

  /**
   * Set current todo for editing
   * @param {number|Object} todoOrId - Todo ID or todo object
   */
  this.setCurrentTodo = function (todoOrId) {
    let todo;

    if (typeof todoOrId === "number") {
      todo = this.getTodoById(todoOrId);
    } else {
      todo = todoOrId;
    }

    this.appState.setState({
      currentTodo: todo,
      formMode: todo && todo.id ? "edit" : "create",
    });
  };

  /**
   * Clear current todo
   */
  this.clearCurrentTodo = function () {
    this.appState.setState({
      currentTodo: null,
      formMode: "create",
    });
  };

  /**
   * Restore todo from trash
   * @param {number} todoId - Todo ID to restore
   * @returns {Promise<Object>} Promise resolving to restored todo
   */
  this.restoreTodo = function (todoId) {
    const trashTodos = this.appState.getState().trashTodos;
    const todoToRestore = trashTodos.find((todo) => todo.id === todoId);

    if (!todoToRestore) {
      return Promise.reject(new Error("Todo not found in trash"));
    }

    // Remove from trash, add back to todos
    const remainingTrash = trashTodos.filter((todo) => todo.id !== todoId);
    const currentTodos = this.appState.getState().todos;

    // Remove deletion metadata
    const restoredTodo = { ...todoToRestore };
    delete restoredTodo.deletedAt;

    this.appState.setState({
      trashTodos: remainingTrash,
      todos: [...currentTodos, restoredTodo],
    });

    this.appState.addNotification({
      type: "success",
      message: "Todo wiederhergestellt",
    });

    return Promise.resolve(restoredTodo);
  };

  /**
   * Permanently delete todo from trash
   * @param {number} todoId - Todo ID to permanently delete
   * @returns {Promise<void>} Promise resolving when todo is permanently deleted
   */
  this.permanentlyDeleteTodo = function (todoId) {
    const trashTodos = this.appState.getState().trashTodos;
    const remainingTrash = trashTodos.filter((todo) => todo.id !== todoId);

    this.appState.setState({ trashTodos: remainingTrash });

    this.appState.addNotification({
      type: "success",
      message: "Todo endgültig gelöscht",
    });

    return Promise.resolve();
  };

  /**
   * Empty entire trash
   * @returns {Promise<void>} Promise resolving when trash is emptied
   */
  this.emptyTrash = function () {
    this.appState.setState({ trashTodos: [] });

    this.appState.addNotification({
      type: "success",
      message: "Papierkorb geleert",
    });

    return Promise.resolve();
  };
}

// Export for use in other modules
if (typeof window !== "undefined") {
  window.TodoService = TodoService;
}
