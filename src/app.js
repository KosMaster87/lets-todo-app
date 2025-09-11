/**
 * Main App Controller (Refactored)
 * Streamlined main app with modular components
 */

class ModularTodoApp {
  constructor() {
    // Core components
    this.appState = null;
    this.enhancedViewManager = null;
    this.todoService = null;

    // Legacy components (for backward compatibility)
    this.sessionManager = null;
    this.apiClient = null;

    // App status
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.isInitialized) return;

    console.log("🚀 Initializing Modular Todo App...");

    try {
      // Initialize core components in order
      await this.initializeCoreComponents();

      // Setup global error handling
      this.setupGlobalErrorHandling();

      // Setup app-level event listeners
      this.setupAppEventListeners();

      // Validate session and determine initial view
      await this.initializeSession();

      this.isInitialized = true;
      console.log("✅ Modular Todo App initialized successfully");

      // Make app globally available for debugging
      if (typeof window !== "undefined") {
        window.modularTodoApp = this;
        window.appState = this.appState;
      }
    } catch (error) {
      console.error("❌ Failed to initialize app:", error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialize core components
   */
  async initializeCoreComponents() {
    console.log("🔧 Initializing core components...");

    // Check if required modules are loaded
    if (typeof AppState === "undefined") {
      throw new Error("AppState module not loaded");
    }
    if (typeof ApiClient === "undefined") {
      throw new Error("ApiClient module not loaded");
    }
    if (typeof SessionManager === "undefined") {
      throw new Error("SessionManager module not loaded");
    }
    if (typeof TodoService === "undefined") {
      throw new Error("TodoService module not loaded");
    }
    if (typeof EnhancedViewManager === "undefined") {
      throw new Error("EnhancedViewManager module not loaded");
    }

    // 1. Initialize State Management
    this.appState = new AppState();
    console.log("✓ AppState initialized");

    // 2. Initialize Legacy Components
    this.apiClient = new ApiClient();
    this.sessionManager = new SessionManager();
    console.log("✓ Legacy components initialized");

    // 3. Initialize Service Layer
    this.todoService = new TodoService(this.apiClient, this.appState);
    console.log("✓ TodoService initialized");

    // 4. Initialize Enhanced View Manager
    this.enhancedViewManager = new EnhancedViewManager(this.appState);
    this.enhancedViewManager.init();
    console.log("✓ Enhanced View Manager initialized");

    // 5. Setup error handler for API client
    this.apiClient.setErrorHandler((msg) => {
      this.appState.setState({ error: msg });
      if (window.UIUtils) {
        window.UIUtils.showToast(msg, "error");
      }
    });

    console.log("✅ All core components initialized");
  }

  /**
   * Setup global error handling
   */
  setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      this.appState.addNotification({
        type: "error",
        message: "Ein unerwarteter Fehler ist aufgetreten",
      });
      event.preventDefault();
    });

    // Handle general errors
    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error);
      this.appState.addNotification({
        type: "error",
        message: "Ein Fehler ist aufgetreten. Bitte laden Sie die Seite neu.",
      });
    });
  }

  /**
   * Setup app-level event listeners
   */
  setupAppEventListeners() {
    // Subscribe to state changes for app-level handling
    this.appState.subscribe(({ changedKeys, newState }) => {
      this.handleStateChange(changedKeys, newState);
    });

    // Handle online/offline status
    window.addEventListener("online", () => {
      this.appState.addNotification({
        type: "success",
        message: "Verbindung wiederhergestellt",
      });
    });

    window.addEventListener("offline", () => {
      this.appState.addNotification({
        type: "warning",
        message: "Keine Internetverbindung",
      });
    });

    // Handle visibility changes (for sync when user returns)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.appState.getState().sessionType) {
        this.handleAppResume();
      }
    });
  }

  /**
   * Handle app-level state changes
   */
  handleStateChange(changedKeys, newState) {
    try {
      // Log state changes in debug mode
      if (ENV && ENV.DEBUG) {
        console.log("🔄 App state changed:", changedKeys, newState);
      }

      // Handle session changes
      if (changedKeys.includes("sessionType")) {
        this.handleSessionTypeChange(newState.sessionType);
      }

      // Handle error states - but avoid infinite loops
      if (
        changedKeys.includes("error") &&
        newState.error &&
        typeof newState.error === "string"
      ) {
        // Only handle error if it's a string message, not an error object to avoid recursion
        console.warn("Error state updated:", newState.error);
      }

      // Handle loading states
      if (changedKeys.includes("loading")) {
        this.handleLoadingStateChange(newState.loading);
      }

      // Handle theme changes
      if (changedKeys.includes("theme")) {
        this.handleThemeChange(newState.theme);
      }
    } catch (error) {
      console.error("Error in handleStateChange:", error);
      // Don't call handleAppError here to avoid infinite recursion
    }
  }

  /**
  /**
   * Initialize session and determine starting view
   */
  async initializeSession() {
    console.log("🔐 Initializing session...");
    this.appState.setLoading(true);

    try {
      const response = await this.sessionManager.validateSession(
        (url, method, data) => this.apiClient.request(url, method, data)
      );

      console.log("Session validation response:", response);

      if (response.valid) {
        // Valid session found
        if (response.type === "user") {
          this.appState.setState({
            sessionType: "user",
            userId: response.userId,
            userEmail: response.email,
            sessionId: response.sessionId,
            loading: false,
          });
          this.appState.navigateToView("dashboard");
        } else if (response.type === "guest") {
          this.appState.setState({
            sessionType: "guest",
            sessionId: response.guestId,
            loading: false,
          });
          this.appState.navigateToView("dashboard");
        }

        // Load todos for valid session
        await this.todoService.loadTodos();
      } else {
        // No valid session - show main menu
        this.appState.setState({
          sessionType: null,
          userId: null,
          userEmail: null,
          sessionId: null,
          loading: false,
        });
        this.appState.navigateToView("main-menu");
      }
    } catch (error) {
      console.error("Session initialization failed:", error);
      this.sessionManager.reset();
      this.appState.setState({
        sessionType: null,
        loading: false,
        error: "Session konnte nicht initialisiert werden",
      });
      this.appState.navigateToView("main-menu");
    }
  }

  /**
   * Start guest session
   */
  async startGuestSession() {
    console.log("👤 Starting guest session...");
    this.appState.setState({ loading: true });

    try {
      const response = await this.sessionManager.startGuestSession(
        (url, method, data) => this.apiClient.request(url, method, data)
      );

      this.appState.setState({
        sessionType: "guest",
        sessionId: response.guestId,
        loading: false,
      });

      // Show success notification using UIUtils if available
      if (window.UIUtils) {
        window.UIUtils.showToast(
          "Gast-Session erfolgreich gestartet!",
          "success"
        );
      }

      // Navigate to dashboard
      this.appState.setState({
        currentView: "dashboard",
        previousView: "main-menu",
      });
    } catch (error) {
      console.error("Guest session start failed:", error);

      this.appState.setState({
        loading: false,
        error: "Gast-Session konnte nicht gestartet werden",
      });

      // Show error notification using UIUtils if available
      if (window.UIUtils) {
        window.UIUtils.showToast(
          "Gast-Session konnte nicht gestartet werden",
          "error"
        );
      }

      // Don't rethrow to prevent further error propagation
    }
  }

  /**
   * Handle session type changes
   */
  handleSessionTypeChange(sessionType) {
    console.log("🔄 Session type changed to:", sessionType);

    // Update UI based on session type
    switch (sessionType) {
      case "guest":
        this.showGuestModeIndicator();
        break;
      case "user":
        this.hideGuestModeIndicator();
        break;
      case null:
        this.hideGuestModeIndicator();
        this.clearUserData();
        break;
    }
  }

  /**
   * Show guest mode indicator
   */
  showGuestModeIndicator() {
    let indicator = document.querySelector(".guest-mode-indicator");

    if (!indicator) {
      indicator = document.createElement("div");
      indicator.className = "guest-mode-indicator";
      indicator.innerHTML = "👤 Gast-Modus";
      indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(255, 152, 0, 0.9);
        color: white;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 12px;
        z-index: 1000;
      `;
      document.body.appendChild(indicator);
    }
  }

  /**
   * Hide guest mode indicator
   */
  hideGuestModeIndicator() {
    const indicator = document.querySelector(".guest-mode-indicator");
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * Clear user data on logout
   */
  clearUserData() {
    this.appState.setState({
      todos: [],
      trashedTodos: [],
      currentTodo: null,
      userId: null,
      userEmail: null,
      sessionId: null,
    });
  }

  /**
   * Handle app errors
   */
  handleAppError(error) {
    console.error("App error:", error);

    // Safely update error state
    try {
      this.appState.setState({
        error: error?.message || "Ein unbekannter Fehler ist aufgetreten",
        loading: false,
      });
    } catch (stateError) {
      console.error("Failed to update error state:", stateError);
    }

    // Show error notification using UIUtils if available
    try {
      if (window.UIUtils) {
        window.UIUtils.showToast(
          error?.message || "Ein unerwarteter Fehler ist aufgetreten",
          "error"
        );
      }
    } catch (toastError) {
      console.error("Failed to show error toast:", toastError);
    }
  }

  /**
   * Handle loading state changes
   */
  handleLoadingStateChange(isLoading) {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
      if (isLoading) {
        loadingOverlay.classList.remove("hidden");
      } else {
        loadingOverlay.classList.add("hidden");
      }
    }
  }

  /**
   * Handle theme changes
   */
  handleThemeChange(theme) {
    if (theme) {
      document.body.setAttribute("data-theme", theme);

      // Store theme preference
      try {
        localStorage.setItem("todoapp-theme", theme);
      } catch (error) {
        console.warn("Could not save theme preference:", error);
      }
    }
  }

  /**
   * Handle app resume (when user returns to tab)
   */
  async handleAppResume() {
    console.log("📱 App resumed, syncing data...");

    const state = this.appState.getState();
    if (state.sessionType && this.todoService) {
      try {
        await this.todoService.loadTodos();
        console.log("✓ Data synced on app resume");
      } catch (error) {
        console.error("❌ Failed to sync data on app resume:", error);
      }
    }
  }

  /**
   * Handle initialization errors
   */
  handleInitializationError(error) {
    console.error("Initialization error:", error);

    // Show fallback UI
    document.body.innerHTML = `
      <div style="
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 100vh; 
        flex-direction: column;
        font-family: 'Comic Neue', cursive;
        background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        padding: 20px;
      ">
        <h1>Oops! 😅</h1>
        <p>Die App konnte nicht vollständig geladen werden.</p>
        <button onclick="window.location.reload()" style="
          margin-top: 20px;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          background: white;
          color: #333;
          cursor: pointer;
          font-family: inherit;
        ">
          Seite neu laden
        </button>
      </div>
    `;
  }

  /**
   * Get current state
   */
  getState() {
    return this.appState.getState();
  }

  /**
   * Get component by name
   */
  getComponent(name) {
    switch (name) {
      case "viewManager":
        return this.enhancedViewManager;
      case "todoService":
        return this.todoService;
      case "sessionManager":
        return this.sessionManager;
      case "apiClient":
        return this.apiClient;
      default:
        return null;
    }
  }

  /**
   * Cleanup app
   */
  cleanup() {
    console.log("🧹 Cleaning up Modular Todo App...");

    // Cleanup components
    if (this.enhancedViewManager) {
      this.enhancedViewManager.cleanup();
    }

    // Clear guest mode indicator
    this.hideGuestModeIndicator();

    // Remove global event listeners
    window.removeEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection
    );
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );

    this.isInitialized = false;
    console.log("✅ App cleanup completed");
  }
}

/**
 * Initialize app when DOM is ready
 */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("📄 DOM loaded, initializing app...");

  try {
    const app = new ModularTodoApp();
    await app.init();

    // Keep reference to old app for backward compatibility
    window.todoApp = app;

    console.log("🎉 App ready!");
  } catch (error) {
    console.error("❌ Failed to start app:", error);

    // Fallback to old app if modular app fails
    if (typeof TodoApp !== "undefined") {
      console.log("🔄 Falling back to legacy app...");
      try {
        window.todoApp = new TodoApp();
        await window.todoApp.init();
        console.log("✅ Legacy app initialized");
      } catch (legacyError) {
        console.error("❌ Even legacy app failed:", legacyError);
        showCriticalError(error, legacyError);
      }
    } else {
      showCriticalError(error);
    }
  }
});

/**
 * Show critical error when app cannot start
 */
function showCriticalError(primaryError, fallbackError = null) {
  document.body.innerHTML = `
    <div style="
      display: flex; 
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      flex-direction: column;
      font-family: Arial, sans-serif;
      background: linear-gradient(180deg, #ff6b6b 0%, #ee5a6f 100%);
      color: white;
      text-align: center;
      padding: 20px;
    ">
      <h1>🚨 Critical Error</h1>
      <p>Die App konnte nicht gestartet werden.</p>
      <details style="margin: 20px 0; text-align: left; max-width: 600px;">
        <summary>Technische Details</summary>
        <pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; overflow: auto;">
Primary Error: ${primaryError.message}
${
  fallbackError
    ? `
Fallback Error: ${fallbackError.message}`
    : ""
}
        </pre>
      </details>
      <button onclick="window.location.reload()" style="
        margin-top: 20px;
        padding: 15px 30px;
        border: none;
        border-radius: 5px;
        background: white;
        color: #333;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
      ">
        Seite neu laden
      </button>
    </div>
  `;
}
