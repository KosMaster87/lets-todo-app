/**
 * Todo-App Frontend - Hauptanwendung mit State Management
 * Features:
 * - Zentrales State Management
 * - Multi-View Navigation
 * - Smart Caching mit Service Layer
 * - Session-basierte Authentifizierung
 */

"use strict";

/**
 * Todo-App Hauptklasse (Refactored with State Management)
 * @constructor
 */
function TodoApp() {
  // Core State Management
  this.appState = null;
  this.viewManager = null;
  this.todoService = null;

  // Legacy components (will be integrated)
  this.sessionManager = null;
  this.apiClient = null;

  /**
   * App-Initialisierung mit State Management
   */
  this.init = function () {
    console.log("🚀 Todo App - Initializing with State Management...");

    // Initialize core components
    this.initializeComponents();

    // Setup subscriptions
    this.setupStateSubscriptions();

    // Setup event listeners
    this.setupEventListeners();

    // Start session validation
    this.validateSession();
  };

  /**
   * Initialize all core components
   * @private
   */
  this.initializeComponents = function () {
    // Initialize State Management
    this.appState = new AppState();

    // Initialize legacy components
    this.apiClient = new ApiClient();
    this.sessionManager = new SessionManager();

    // Initialize service layer
    this.todoService = new TodoService(this.apiClient, this.appState);

    // Initialize view manager
    this.viewManager = new ViewManager(this.appState);

    // Error handler für API-Client
    this.apiClient.setErrorHandler((msg) => {
      this.appState.setError(msg);
      this.appState.addNotification({
        type: "error",
        message: msg,
      });
    });

    console.log("✅ Core components initialized");
  };

  /**
   * Setup state change subscriptions
   * @private
   */
  this.setupStateSubscriptions = function () {
    this.appState.subscribe(({ changedKeys, newState }) => {
      // Log state changes in development
      if (ENV && ENV.DEBUG) {
        console.log("🔄 State changed:", changedKeys, newState);
      }

      // Handle specific state changes
      if (changedKeys.includes("sessionType")) {
        this.onSessionChange(newState.sessionType);
      }

      if (changedKeys.includes("error") && newState.error) {
        this.displayError(newState.error);
      }

      if (changedKeys.includes("currentTodo")) {
        this.onCurrentTodoChange(newState.currentTodo);
      }
    });
  };

  /**
   * Setup global event listeners for navigation
   * @private
   */
  this.setupEventListeners = function () {
    // Main Menu Navigation
    this.addClickListener("guestBtn", () => this.startGuestSession());
    this.addClickListener("registerBtn", () => this.navigateToView("register"));
    this.addClickListener("loginBtn", () => this.navigateToView("login"));
    this.addClickListener("optionBtn", () => this.navigateToView("options"));

    // Authentication Form Events
    this.addClickListener("registerSubmitBtn", (e) =>
      this.handleRegisterSubmit(e)
    );
    this.addClickListener("registerCancelBtn", () =>
      this.navigateToView("main-menu")
    );
    this.addClickListener("loginSubmitBtn", (e) => this.handleLoginSubmit(e));
    this.addClickListener("loginCancelBtn", () =>
      this.navigateToView("main-menu")
    );

    // Options Menu
    this.addClickListener("themeToggleBtn", () => this.toggleTheme());
    this.addClickListener("personalDataBtn", () =>
      this.navigateToView("personal-data")
    );
    this.addClickListener("optionsCancelBtn", () =>
      this.navigateToView("main-menu")
    );

    // Personal Data Menu
    this.addClickListener("resetPasswordBtn", () =>
      this.navigateToView("change-password")
    );
    this.addClickListener("downloadNotesBtn", () => this.downloadTodos());
    this.addClickListener("uploadNotesBtn", () => this.uploadTodos());
    this.addClickListener("personalDataCancelBtn", () =>
      this.navigateToView("options")
    );

    // Dashboard Navigation
    this.addClickListener("notesListDashboardBtn", () =>
      this.navigateToView("notes-list")
    );
    this.addClickListener("createNoteDashboardBtn", () => this.createNewTodo());
    this.addClickListener("trashDashboardBtn", () =>
      this.navigateToView("trash")
    );
    this.addClickListener("dashboardCancelBtn", () =>
      this.navigateToView("main-menu")
    );

    // Notes Management
    this.addClickListener("notesSaveBtn", (e) => this.handleSaveTodo(e));
    this.addClickListener("notesCancelBtn", () => this.navigateBack());
    this.addClickListener("notesListCancelBtn", () =>
      this.navigateToView("dashboard")
    );
    this.addClickListener("noteViewBackBtn", () =>
      this.navigateToView("notes-list")
    );
    this.addClickListener("editNoteBtn", () => this.editCurrentTodo());

    // Trash Management
    this.addClickListener("emptyTrashBtn", () => this.emptyTrash());
    this.addClickListener("trashCancelBtn", () =>
      this.navigateToView("dashboard")
    );

    // Dynamic event delegation for todo items
    document.addEventListener("click", (e) => this.handleDynamicEvents(e));
  };

  /**
   * Helper to add click event listeners
   * @private
   */
  this.addClickListener = function (id, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", handler);
    }
  };

  /**
   * Handle dynamic events (todo items, etc.)
   * @private
   */
  this.handleDynamicEvents = function (e) {
    const action = e.target.dataset.action;
    const todoId = e.target.dataset.id;

    if (action && todoId) {
      switch (action) {
        case "edit":
          this.editTodo(parseInt(todoId));
          break;
        case "delete":
          this.deleteTodo(parseInt(todoId));
          break;
        case "toggle":
          this.toggleTodo(parseInt(todoId));
          break;
        case "view":
          this.viewTodo(parseInt(todoId));
          break;
        case "restore":
          this.restoreTodo(parseInt(todoId));
          break;
      }
    }
  };

  /**
   * Session validation using existing SessionManager
   */
  this.validateSession = function () {
    console.log("🔐 Validating session...");

    this.sessionManager
      .validateSession((url, method, data) =>
        this.apiClient.request(url, method, data)
      )
      .then((response) => {
        console.log("Session validation response:", response);

        if (response.valid) {
          // Update state with session info
          if (response.type === "user") {
            this.appState.setState({
              sessionType: "user",
              userId: response.userId,
              userEmail: response.email,
              sessionId: response.sessionId,
            });
            this.navigateToView("dashboard");
          } else if (response.type === "guest") {
            this.appState.setState({
              sessionType: "guest",
              sessionId: response.guestId,
            });
            this.navigateToView("dashboard");
          }

          // Load todos if session is valid
          this.todoService.loadTodos();
        } else {
          // No valid session - show main menu
          this.appState.setState({
            sessionType: null,
            userId: null,
            userEmail: null,
            sessionId: null,
          });
          this.navigateToView("main-menu");
        }
      })
      .catch((error) => {
        console.error("Session validation failed:", error);
        this.sessionManager.reset();
        this.appState.setState({
          sessionType: null,
          error: "Session-Validierung fehlgeschlagen",
        });
        this.navigateToView("main-menu");
      });
  };

  /**
   * Start guest session
   */
  this.startGuestSession = function () {
    this.appState.setLoading(true);

    this.sessionManager
      .startGuestSession((url, method, data) =>
        this.apiClient.request(url, method, data)
      )
      .then((response) => {
        this.appState.setState({
          sessionType: "guest",
          sessionId: response.guestId,
          loading: false,
        });
        this.appState.addNotification({
          type: "success",
          message: "Gast-Session gestartet!",
        });
        this.navigateToView("dashboard");
      })
      .catch((error) => {
        this.appState.setState({
          loading: false,
          error: "Gast-Session konnte nicht gestartet werden",
        });
      });
  };

  /**
   * Handle user registration
   */
  this.handleRegisterSubmit = function (e) {
    e.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const terms = document.getElementById("registerTerms").checked;

    if (!terms) {
      this.appState.addNotification({
        type: "error",
        message: "Bitte akzeptiere die Nutzungsbedingungen",
      });
      return;
    }

    this.appState.setLoading(true);

    // Use sessionManager for registration
    this.sessionManager
      .registerUser({ name, email, password }, (url, method, data) =>
        this.apiClient.request(url, method, data)
      )
      .then((response) => {
        this.appState.setState({
          sessionType: "user",
          userId: response.userId,
          userEmail: email,
          loading: false,
        });
        this.appState.addNotification({
          type: "success",
          message: "Registrierung erfolgreich!",
        });
        this.navigateToView("dashboard");
        this.todoService.loadTodos();
      })
      .catch((error) => {
        this.appState.setState({
          loading: false,
          error: "Registrierung fehlgeschlagen",
        });
      });
  };

  /**
   * Handle user login
   */
  this.handleLoginSubmit = function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    this.appState.setLoading(true);

    this.sessionManager
      .loginUser({ email, password }, (url, method, data) =>
        this.apiClient.request(url, method, data)
      )
      .then((response) => {
        this.appState.setState({
          sessionType: "user",
          userId: response.userId,
          userEmail: email,
          loading: false,
        });
        this.appState.addNotification({
          type: "success",
          message: "Anmeldung erfolgreich!",
        });
        this.navigateToView("dashboard");
        this.todoService.loadTodos();
      })
      .catch((error) => {
        this.appState.setState({
          loading: false,
          error: "Anmeldung fehlgeschlagen",
        });
      });
  };

  /**
   * Navigation helpers
   */
  this.navigateToView = function (viewName, data = {}) {
    this.appState.navigateToView(viewName, data);
  };

  this.navigateBack = function () {
    this.appState.navigateBack();
  };

  /**
   * Todo management functions
   */
  this.createNewTodo = function () {
    this.todoService.clearCurrentTodo();
    this.navigateToView("notes");
  };

  this.editTodo = function (todoId) {
    this.todoService.setCurrentTodo(todoId);
    this.navigateToView("notes");
  };

  this.viewTodo = function (todoId) {
    this.todoService.setCurrentTodo(todoId);
    this.navigateToView("note-view");
  };

  this.deleteTodo = function (todoId) {
    if (confirm("Todo wirklich löschen?")) {
      this.todoService.deleteTodo(todoId);
    }
  };

  this.toggleTodo = function (todoId) {
    this.todoService.toggleTodo(todoId);
  };

  this.restoreTodo = function (todoId) {
    this.todoService.restoreTodo(todoId);
  };

  this.handleSaveTodo = function (e) {
    e.preventDefault();

    const title = document.getElementById("noteTitle").value;
    const description = document.getElementById("noteContent").value;
    const completed = document.getElementById("noteCompleted").checked;

    const todoData = { title, description, completed: completed ? 1 : 0 };
    const currentTodo = this.appState.getState().currentTodo;

    if (currentTodo && currentTodo.id) {
      // Update existing todo
      this.todoService
        .updateTodo(currentTodo.id, todoData)
        .then(() => this.navigateToView("notes-list"));
    } else {
      // Create new todo
      this.todoService
        .createTodo(todoData)
        .then(() => this.navigateToView("notes-list"));
    }
  };

  this.editCurrentTodo = function () {
    const currentTodo = this.appState.getState().currentTodo;
    if (currentTodo) {
      this.navigateToView("notes");
    }
  };

  /**
   * Theme management
   */
  this.toggleTheme = function () {
    const currentTheme = this.appState.getState().theme;
    const newTheme = currentTheme === "light" ? "dark" : "light";

    this.appState.setState({ theme: newTheme });
    document.body.setAttribute("data-theme", newTheme);

    this.appState.addNotification({
      type: "success",
      message: `${newTheme === "dark" ? "Dunkles" : "Helles"} Theme aktiviert`,
    });
  };

  /**
   * Utility functions
   */
  this.downloadTodos = function () {
    const todos = this.appState.getState().todos;
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = "todos-backup.json";
    link.click();

    this.appState.addNotification({
      type: "success",
      message: "Todos erfolgreich heruntergeladen",
    });
  };

  this.uploadTodos = function () {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const todos = JSON.parse(e.target.result);
            // TODO: Implement upload to server
            console.log("Uploaded todos:", todos);
            this.appState.addNotification({
              type: "success",
              message: "Todos erfolgreich importiert",
            });
          } catch (error) {
            this.appState.addNotification({
              type: "error",
              message: "Fehler beim Importieren der Todos",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  this.emptyTrash = function () {
    if (
      confirm(
        "Papierkorb wirklich leeren? Alle Todos werden endgültig gelöscht."
      )
    ) {
      this.todoService.emptyTrash();
    }
  };

  /**
   * Event handlers for state changes
   */
  this.onSessionChange = function (sessionType) {
    console.log("Session changed to:", sessionType);
    // Additional logic when session changes
  };

  this.onCurrentTodoChange = function (currentTodo) {
    console.log("Current todo changed to:", currentTodo);
    // Additional logic when current todo changes
  };

  /**
   * Display error in UI
   */
  this.displayError = function (errorMessage) {
    console.error("App Error:", errorMessage);
    // Error is already handled by notifications in appState
  };
}

/**
 * Initialize app when DOM is ready
 */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize ViewManager after DOM is ready
  const todoApp = new TodoApp();
  todoApp.init();

  // Initialize ViewManager
  if (todoApp.viewManager) {
    todoApp.viewManager.init();
  }

  // Make app globally available for debugging
  if (typeof window !== "undefined") {
    window.todoApp = todoApp;
    window.appState = todoApp.appState;
  }
});
