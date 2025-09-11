/**
 * Notes Management Views
 * Handles todo creation, editing, viewing and listing
 */

class NotesView {
  constructor(appState, viewManager) {
    this.appState = appState;
    this.viewManager = viewManager;
  }

  /**
   * Initialize all notes views
   */
  init() {
    this.setupNotesEditor();
    this.setupNotesListView();
    this.setupNoteDetailView();
  }

  /**
   * Setup notes editor (create/edit view)
   */
  setupNotesEditor() {
    // Save button
    const saveBtn = document.getElementById("notesSaveBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", (e) => this.handleSaveTodo(e));
    }

    // Cancel button
    const cancelBtn = document.getElementById("notesCancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.handleCancelEdit());
    }

    // Action buttons
    this.setupNoteActions();

    // Auto-save functionality
    this.setupAutoSave();

    // Form validation
    this.setupFormValidation();
  }

  /**
   * Setup notes list view
   */
  setupNotesListView() {
    // Filter button
    const filterBtn = document.getElementById("notesListFilterBtn");
    if (filterBtn) {
      filterBtn.addEventListener("click", () => this.handleFilterToggle());
    }

    // Back button
    const backBtn = document.getElementById("notesListCancelBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () =>
        this.appState.navigateToView("dashboard")
      );
    }

    // Setup state subscription for list updates
    this.appState.subscribe(({ changedKeys, newState }) => {
      if (changedKeys.includes("todos")) {
        this.renderTodosList(newState.todos);
      }
    });
  }

  /**
   * Setup note detail view
   */
  setupNoteDetailView() {
    // Back button
    const backBtn = document.getElementById("noteViewBackBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () =>
        this.appState.navigateToView("notes-list")
      );
    }

    // Save button (for inline editing)
    const saveBtn = document.getElementById("noteViewSaveBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.handleInlineSave());
    }

    // Edit button
    const editBtn = document.getElementById("editNoteBtn");
    if (editBtn) {
      editBtn.addEventListener("click", () => this.handleEditNote());
    }

    // Action buttons
    this.setupNoteViewActions();
  }

  /**
   * Setup note action buttons (bookmark, share, copy, delete)
   */
  setupNoteActions() {
    // Bookmark button
    const bookmarkBtn = document.getElementById("bookmarkBtn");
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener("click", () => this.handleBookmark());
    }

    // Share button
    const shareBtn = document.getElementById("shareBtn");
    if (shareBtn) {
      shareBtn.addEventListener("click", () => this.handleShare());
    }

    // Copy button
    const copyBtn = document.getElementById("copyBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => this.handleCopy());
    }

    // Delete button
    const deleteBtn = document.getElementById("deleteNoteBtn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => this.handleDelete());
    }
  }

  /**
   * Setup note view action buttons
   */
  setupNoteViewActions() {
    // Bookmark view button
    const bookmarkViewBtn = document.getElementById("bookmarkViewBtn");
    if (bookmarkViewBtn) {
      bookmarkViewBtn.addEventListener("click", () =>
        this.handleBookmarkToggle()
      );
    }

    // Share note button
    const shareNoteBtn = document.getElementById("shareNoteBtn");
    if (shareNoteBtn) {
      shareNoteBtn.addEventListener("click", () => this.handleShareNote());
    }

    // Copy note button
    const copyNoteBtn = document.getElementById("copyNoteBtn");
    if (copyNoteBtn) {
      copyNoteBtn.addEventListener("click", () => this.handleCopyNote());
    }

    // Delete view note button
    const deleteViewBtn = document.getElementById("deleteViewNoteBtn");
    if (deleteViewBtn) {
      deleteViewBtn.addEventListener("click", () => this.handleDeleteNote());
    }
  }

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    let autoSaveTimeout;
    const autoSaveDelay = 3000; // 3 seconds

    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");

    const triggerAutoSave = () => {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(() => {
        this.handleAutoSave();
      }, autoSaveDelay);
    };

    if (titleInput) {
      titleInput.addEventListener("input", triggerAutoSave);
    }

    if (contentInput) {
      contentInput.addEventListener("input", triggerAutoSave);
    }
  }

  /**
   * Setup form validation
   */
  setupFormValidation() {
    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");

    if (titleInput) {
      titleInput.addEventListener("blur", () => this.validateTitle());
    }

    if (contentInput) {
      contentInput.addEventListener("blur", () => this.validateContent());
    }
  }

  /**
   * Handle save todo
   */
  handleSaveTodo(e) {
    e.preventDefault();

    const formData = this.getFormData();
    const validation = this.validateForm(formData);

    if (!validation.isValid) {
      this.appState.addNotification({
        type: "error",
        message: validation.message,
      });
      return;
    }

    const state = this.appState.getState();
    const currentTodo = state.currentTodo;

    if (currentTodo && currentTodo.id) {
      // Update existing todo
      this.updateTodo(currentTodo.id, formData);
    } else {
      // Create new todo
      this.createTodo(formData);
    }
  }

  /**
   * Handle auto-save
   */
  handleAutoSave() {
    const formData = this.getFormData();

    if (!formData.title && !formData.content) {
      return; // Don't auto-save empty forms
    }

    const state = this.appState.getState();
    const currentTodo = state.currentTodo;

    if (currentTodo && currentTodo.id) {
      // Auto-update existing todo
      this.updateTodo(currentTodo.id, formData, true);
    }
    // Don't auto-create new todos
  }

  /**
   * Create new todo
   */
  createTodo(formData) {
    if (window.todoApp && window.todoApp.todoService) {
      window.todoApp.todoService
        .createTodo(formData)
        .then(() => {
          this.appState.addNotification({
            type: "success",
            message: "Todo erfolgreich erstellt!",
          });
          this.clearForm();
          this.appState.navigateToView("notes-list");
        })
        .catch((error) => {
          this.appState.addNotification({
            type: "error",
            message: "Fehler beim Erstellen des Todos",
          });
        });
    }
  }

  /**
   * Update existing todo
   */
  updateTodo(todoId, formData, isAutoSave = false) {
    if (window.todoApp && window.todoApp.todoService) {
      window.todoApp.todoService
        .updateTodo(todoId, formData)
        .then(() => {
          if (!isAutoSave) {
            this.appState.addNotification({
              type: "success",
              message: "Todo erfolgreich aktualisiert!",
            });
            this.appState.navigateToView("notes-list");
          }
        })
        .catch((error) => {
          this.appState.addNotification({
            type: "error",
            message: "Fehler beim Aktualisieren des Todos",
          });
        });
    }
  }

  /**
   * Get form data
   */
  getFormData() {
    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");
    const completedInput = document.getElementById("noteCompleted");

    return {
      title: titleInput ? titleInput.value.trim() : "",
      description: contentInput ? contentInput.value.trim() : "",
      completed: completedInput ? (completedInput.checked ? 1 : 0) : 0,
    };
  }

  /**
   * Validate form
   */
  validateForm(formData) {
    if (!formData.title) {
      return { isValid: false, message: "Titel ist erforderlich" };
    }

    if (formData.title.length < 3) {
      return {
        isValid: false,
        message: "Titel muss mindestens 3 Zeichen lang sein",
      };
    }

    if (!formData.description) {
      return { isValid: false, message: "Beschreibung ist erforderlich" };
    }

    return { isValid: true };
  }

  /**
   * Validate individual fields
   */
  validateTitle() {
    const titleInput = document.getElementById("noteTitle");
    if (!titleInput) return true;

    const title = titleInput.value.trim();
    if (title && title.length < 3) {
      titleInput.style.borderColor = "#f44336";
      return false;
    }

    titleInput.style.borderColor = "";
    return true;
  }

  validateContent() {
    const contentInput = document.getElementById("noteContent");
    if (!contentInput) return true;

    const content = contentInput.value.trim();
    if (content && content.length < 10) {
      contentInput.style.borderColor = "#f44336";
      return false;
    }

    contentInput.style.borderColor = "";
    return true;
  }

  /**
   * Clear form
   */
  clearForm() {
    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");
    const completedInput = document.getElementById("noteCompleted");

    if (titleInput) {
      titleInput.value = "";
      titleInput.style.borderColor = "";
    }
    if (contentInput) {
      contentInput.value = "";
      contentInput.style.borderColor = "";
    }
    if (completedInput) {
      completedInput.checked = false;
    }
  }

  /**
   * Load todo into form
   */
  loadTodoIntoForm(todo) {
    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");
    const completedInput = document.getElementById("noteCompleted");

    if (titleInput) titleInput.value = todo.title || "";
    if (contentInput) contentInput.value = todo.description || "";
    if (completedInput) completedInput.checked = todo.completed === 1;
  }

  /**
   * Render todos list
   */
  renderTodosList(todos) {
    const listContainer = document.querySelector(".notes-list");
    if (!listContainer) return;

    if (!todos || todos.length === 0) {
      listContainer.innerHTML = `
        <div class="note-placeholder">
          <p>Noch keine Todos vorhanden. Erstelle dein erstes Todo!</p>
        </div>
      `;
      return;
    }

    const todosHtml = todos.map((todo) => this.renderTodoItem(todo)).join("");
    listContainer.innerHTML = todosHtml;
  }

  /**
   * Render individual todo item
   */
  renderTodoItem(todo) {
    const completedClass = todo.completed ? "completed" : "";
    const priorityClass = todo.priority ? `priority-${todo.priority}` : "";

    return `
      <div class="todo-item ${completedClass} ${priorityClass}" data-id="${
      todo.id
    }">
        <div class="todo-content">
          <h4 class="todo-title">${this.escapeHtml(todo.title)}</h4>
          <p class="todo-description">${this.escapeHtml(
            todo.description?.substring(0, 100) || ""
          )}${todo.description?.length > 100 ? "..." : ""}</p>
          <div class="todo-meta">
            <span class="todo-date">${this.formatDate(todo.created_at)}</span>
            ${
              todo.completed
                ? '<span class="todo-status completed">Erledigt</span>'
                : '<span class="todo-status open">Offen</span>'
            }
          </div>
        </div>
        <div class="todo-actions">
          <button class="action-btn view-btn" data-action="view" data-id="${
            todo.id
          }" title="Ansehen">
            <div class="action-icon view-icon"></div>
          </button>
          <button class="action-btn edit-btn" data-action="edit" data-id="${
            todo.id
          }" title="Bearbeiten">
            <div class="action-icon edit-icon"></div>
          </button>
          <button class="action-btn toggle-btn" data-action="toggle" data-id="${
            todo.id
          }" title="${
      todo.completed ? "Als offen markieren" : "Als erledigt markieren"
    }">
            <div class="action-icon ${
              todo.completed ? "reopen-icon" : "complete-icon"
            }"></div>
          </button>
          <button class="action-btn delete-btn" data-action="delete" data-id="${
            todo.id
          }" title="Löschen">
            <div class="action-icon delete-icon"></div>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Event handlers
   */
  handleCancelEdit() {
    const state = this.appState.getState();
    if (state.navigationHistory && state.navigationHistory.length > 0) {
      this.appState.navigateBack();
    } else {
      this.appState.navigateToView("dashboard");
    }
  }

  handleBookmark() {
    const state = this.appState.getState();
    const currentTodo = state.currentTodo;

    if (currentTodo && currentTodo.id) {
      // Toggle bookmark status
      const newBookmarkState = !currentTodo.bookmarked;
      this.updateTodo(currentTodo.id, { bookmarked: newBookmarkState ? 1 : 0 });
    }
  }

  handleShare() {
    const formData = this.getFormData();

    if (navigator.share && formData.title && formData.description) {
      navigator.share({
        title: formData.title,
        text: formData.description,
      });
    } else {
      // Fallback: copy to clipboard
      this.handleCopy();
    }
  }

  handleCopy() {
    const formData = this.getFormData();
    const content = `${formData.title}\n\n${formData.description}`;

    navigator.clipboard.writeText(content).then(() => {
      this.appState.addNotification({
        type: "success",
        message: "Todo in Zwischenablage kopiert",
      });
    });
  }

  handleDelete() {
    const state = this.appState.getState();
    const currentTodo = state.currentTodo;

    if (currentTodo && currentTodo.id) {
      if (confirm("Todo wirklich löschen?")) {
        if (window.todoApp && window.todoApp.todoService) {
          window.todoApp.todoService.deleteTodo(currentTodo.id);
          this.appState.navigateToView("notes-list");
        }
      }
    }
  }

  /**
   * Utility functions
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  /**
   * View activation handlers
   */
  onNotesViewActivated() {
    const state = this.appState.getState();
    if (state.currentTodo) {
      this.loadTodoIntoForm(state.currentTodo);
    } else {
      this.clearForm();
    }
  }

  onNotesListViewActivated() {
    const state = this.appState.getState();
    this.renderTodosList(state.todos);
  }

  /**
   * Cleanup
   */
  cleanup() {
    console.log("NotesView cleanup");
  }
}

// Export for module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = NotesView;
}
