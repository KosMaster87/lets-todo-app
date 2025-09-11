/**
 * View Manager for handling multi-view navigation
 * Manages switching between different app views
 * @param {AppState} appState - Central application state
 * @constructor
 */
function ViewManager(appState) {
  this.appState = appState;
  this.currentView = null;
  this.viewElements = new Map();

  // Initialize view manager
  this.init = function () {
    this.cacheViewElements();
    this.subscribeToStateChanges();

    // Show initial view
    const initialView = this.appState.getState().currentView;
    this.showView(initialView);
  };

  /**
   * Cache all view elements for performance
   * @private
   */
  this.cacheViewElements = function () {
    const views = [
      "main-menu",
      "register",
      "login",
      "options",
      "personal-data",
      "change-password",
      "trash",
      "notes",
      "notes-list",
      "note-view",
      "dashboard",
    ];

    views.forEach((viewName) => {
      const element = document.querySelector(`[data-view="${viewName}"]`);
      if (element) {
        this.viewElements.set(viewName, element);
      }
    });
  };

  /**
   * Subscribe to state changes for automatic view updates
   * @private
   */
  this.subscribeToStateChanges = function () {
    this.appState.subscribe(({ changedKeys, newState }) => {
      if (changedKeys.includes("currentView")) {
        this.showView(newState.currentView);
      }

      if (changedKeys.includes("loading")) {
        this.toggleLoadingOverlay(newState.loading);
      }

      if (changedKeys.includes("notifications")) {
        this.updateNotifications(newState.notifications);
      }
    });
  };

  /**
   * Show a specific view and hide others
   * @param {string} viewName - Name of the view to show
   * @param {Object} data - Optional data for view initialization
   */
  this.showView = function (viewName, data = {}) {
    // Hide current view
    if (this.currentView && this.viewElements.has(this.currentView)) {
      this.viewElements.get(this.currentView).classList.add("hidden");
    }

    // Show new view
    const newViewElement = this.viewElements.get(viewName);
    if (newViewElement) {
      newViewElement.classList.remove("hidden");
      this.currentView = viewName;

      // Initialize view-specific functionality
      this.initializeView(viewName, data);
    } else {
      console.warn(`View "${viewName}" not found in DOM`);
    }
  };

  /**
   * Initialize view-specific functionality
   * @private
   */
  this.initializeView = function (viewName, data) {
    const state = this.appState.getState();

    switch (viewName) {
      case "main-menu":
        this.initMainMenu();
        break;

      case "notes-list":
        this.initNotesList();
        break;

      case "notes":
        this.initNotesForm(data);
        break;

      case "note-view":
        this.initNoteView(data);
        break;

      case "dashboard":
        this.initDashboard();
        break;

      case "trash":
        this.initTrash();
        break;

      case "register":
        this.initRegisterForm();
        break;

      case "login":
        this.initLoginForm();
        break;

      case "options":
        this.initOptions();
        break;

      case "personal-data":
        this.initPersonalData();
        break;
    }
  };

  /**
   * Initialize main menu view
   * @private
   */
  this.initMainMenu = function () {
    const state = this.appState.getState();

    // Show/hide buttons based on session status
    const guestBtn = document.getElementById("guestBtn");
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");

    if (state.sessionType === "user") {
      // User is logged in - hide guest/login/register buttons
      if (guestBtn) guestBtn.style.display = "none";
      if (loginBtn) loginBtn.style.display = "none";
      if (registerBtn) registerBtn.style.display = "none";
    } else {
      // Show all authentication options
      if (guestBtn) guestBtn.style.display = "flex";
      if (loginBtn) loginBtn.style.display = "flex";
      if (registerBtn) registerBtn.style.display = "flex";
    }
  };

  /**
   * Initialize notes list view
   * @private
   */
  this.initNotesList = function () {
    const state = this.appState.getState();
    const notesContainer = document.querySelector(".notes-list");

    if (notesContainer) {
      this.renderTodosList(notesContainer, state.todos, state.todoListFilter);
    }
  };

  /**
   * Initialize notes form view
   * @private
   */
  this.initNotesForm = function (data) {
    const state = this.appState.getState();
    const currentTodo = data.todo || state.currentTodo;

    if (currentTodo) {
      // Populate form with existing todo data
      const titleInput = document.getElementById("noteTitle");
      const contentInput = document.getElementById("noteContent");

      if (titleInput) titleInput.value = currentTodo.title || "";
      if (contentInput) contentInput.value = currentTodo.description || "";
    }
  };

  /**
   * Initialize note view (read-only)
   * @private
   */
  this.initNoteView = function (data) {
    const todo = data.todo || this.appState.getState().currentTodo;

    if (todo) {
      const titleElement = document.getElementById("noteDisplayTitle");
      const contentElement = document.getElementById("noteContentDisplay");

      if (titleElement) titleElement.textContent = todo.title;
      if (contentElement) contentElement.textContent = todo.description;
    }
  };

  /**
   * Initialize dashboard view
   * @private
   */
  this.initDashboard = function () {
    const state = this.appState.getState();

    // Update dashboard statistics
    const totalNotes = state.todos.length;
    const completedNotes = state.todos.filter((t) => t.completed).length;
    const trashCount = state.trashTodos.length;

    // Update UI elements if they exist
    const statsElements = {
      total: document.querySelector(".dashboard-total-notes"),
      completed: document.querySelector(".dashboard-completed-notes"),
      trash: document.querySelector(".dashboard-trash-count"),
    };

    if (statsElements.total) statsElements.total.textContent = totalNotes;
    if (statsElements.completed)
      statsElements.completed.textContent = completedNotes;
    if (statsElements.trash) statsElements.trash.textContent = trashCount;
  };

  /**
   * Initialize trash view
   * @private
   */
  this.initTrash = function () {
    const state = this.appState.getState();
    const trashContainer = document.querySelector(".trash-notes-list");

    if (trashContainer) {
      this.renderTodosList(trashContainer, state.trashTodos, "all");
    }
  };

  /**
   * Initialize register form
   * @private
   */
  this.initRegisterForm = function () {
    // Clear form and focus first input
    const form = document.querySelector(".register-menu");
    if (form) {
      form.reset?.();
      const firstInput = form.querySelector("input");
      if (firstInput) firstInput.focus();
    }
  };

  /**
   * Initialize login form
   * @private
   */
  this.initLoginForm = function () {
    // Clear form and focus first input
    const form = document.querySelector(".login-menu");
    if (form) {
      form.reset?.();
      const firstInput = form.querySelector("input");
      if (firstInput) firstInput.focus();
    }
  };

  /**
   * Initialize options view
   * @private
   */
  this.initOptions = function () {
    const state = this.appState.getState();

    // Update theme toggle button state
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
      const content = themeBtn.querySelector(".btn-content h3");
      if (content) {
        content.textContent =
          state.theme === "dark" ? "Light Mode" : "Dark Mode";
      }
    }
  };

  /**
   * Initialize personal data view
   * @private
   */
  this.initPersonalData = function () {
    const state = this.appState.getState();

    // Show user info if available
    if (state.userEmail) {
      const emailDisplay = document.querySelector(".user-email-display");
      if (emailDisplay) {
        emailDisplay.textContent = state.userEmail;
      }
    }
  };

  /**
   * Render todos list in a container
   * @private
   */
  this.renderTodosList = function (container, todos, filter) {
    if (!container) return;

    // Filter todos
    const filteredTodos = todos.filter((todo) => {
      switch (filter) {
        case "completed":
          return todo.completed;
        case "pending":
          return !todo.completed;
        default:
          return true;
      }
    });

    // Clear container
    container.innerHTML = "";

    if (filteredTodos.length === 0) {
      container.innerHTML =
        '<div class="note-placeholder"><p>Keine Notizen vorhanden.</p></div>';
      return;
    }

    // Render each todo
    filteredTodos.forEach((todo) => {
      const todoElement = this.createTodoElement(todo);
      container.appendChild(todoElement);
    });
  };

  /**
   * Create a DOM element for a todo
   * @private
   */
  this.createTodoElement = function (todo) {
    const todoDiv = document.createElement("div");
    todoDiv.className = "todo-item";
    todoDiv.dataset.id = todo.id;

    todoDiv.innerHTML = `
      <div class="todo-content">
        <h4>${this.escapeHtml(todo.title)}</h4>
        <p>${this.escapeHtml(todo.description)}</p>
        <span class="todo-status ${todo.completed ? "completed" : "pending"}">
          ${todo.completed ? "Erledigt" : "Offen"}
        </span>
      </div>
      <div class="todo-actions">
        <button class="action-btn edit-btn" data-action="edit" data-id="${
          todo.id
        }">
          <div class="action-icon edit-icon"></div>
        </button>
        <button class="action-btn delete-btn" data-action="delete" data-id="${
          todo.id
        }">
          <div class="action-icon delete-icon"></div>
        </button>
      </div>
    `;

    return todoDiv;
  };

  /**
   * Toggle loading overlay
   * @private
   */
  this.toggleLoadingOverlay = function (show) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      if (show) {
        overlay.classList.remove("hidden");
      } else {
        overlay.classList.add("hidden");
      }
    }
  };

  /**
   * Update notifications display
   * @private
   */
  this.updateNotifications = function (notifications) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    // Clear existing notifications
    container.innerHTML = "";

    // Add current notifications
    notifications.forEach((notification) => {
      const toast = this.createToastElement(notification);
      container.appendChild(toast);

      // Auto-remove after duration
      if (notification.duration > 0) {
        setTimeout(() => {
          this.appState.removeNotification(notification.id);
        }, notification.duration);
      }
    });
  };

  /**
   * Create a toast notification element
   * @private
   */
  this.createToastElement = function (notification) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${notification.type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${this.escapeHtml(
          notification.message
        )}</span>
        <button class="toast-close" onclick="appState.removeNotification(${
          notification.id
        })">&times;</button>
      </div>
    `;
    return toast;
  };

  /**
   * Escape HTML to prevent XSS
   * @private
   */
  this.escapeHtml = function (text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  /**
   * Navigate to a view (public method)
   * @param {string} viewName - Target view name
   * @param {Object} data - Optional data for the view
   */
  this.navigateToView = function (viewName, data = {}) {
    this.appState.navigateToView(viewName, data);
  };

  /**
   * Navigate back to previous view (public method)
   */
  this.navigateBack = function () {
    this.appState.navigateBack();
  };
}

// Export for use in other modules
if (typeof window !== "undefined") {
  window.ViewManager = ViewManager;
}
