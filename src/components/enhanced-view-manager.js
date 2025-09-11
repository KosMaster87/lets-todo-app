/**
 * Enhanced View Manager
 * Central controller for all view components with better modularity
 */

class EnhancedViewManager {
  constructor(appState) {
    this.appState = appState;
    this.currentView = null;
    this.viewComponents = new Map();
    this.viewElements = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize view manager and all view components
   */
  init() {
    if (this.isInitialized) return;

    console.log("🎨 Initializing Enhanced View Manager...");

    // Cache view elements
    this.cacheViewElements();

    // Initialize view components
    this.initializeViewComponents();

    // Setup state subscription
    this.setupStateSubscription();

    // Setup global event delegation
    this.setupGlobalEventHandlers();

    this.isInitialized = true;
    console.log("✅ Enhanced View Manager initialized");
  }

  /**
   * Cache all view elements for performance
   */
  cacheViewElements() {
    const viewElements = document.querySelectorAll("[data-view]");

    viewElements.forEach((element) => {
      const viewName = element.getAttribute("data-view");
      this.viewElements.set(viewName, element);
    });

    console.log(`📋 Cached ${this.viewElements.size} view elements`);
  }

  /**
   * Initialize all view components
   */
  initializeViewComponents() {
    console.log("🔧 Initializing view components...");

    // Check if view component classes are available
    const availableComponents = {};

    if (typeof MainMenuView !== "undefined") {
      availableComponents.MainMenuView = MainMenuView;
    }
    if (typeof AuthView !== "undefined") {
      availableComponents.AuthView = AuthView;
    }
    if (typeof DashboardView !== "undefined") {
      availableComponents.DashboardView = DashboardView;
    }
    if (typeof NotesView !== "undefined") {
      availableComponents.NotesView = NotesView;
    }
    if (typeof SettingsView !== "undefined") {
      availableComponents.SettingsView = SettingsView;
    }
    if (typeof TrashView !== "undefined") {
      availableComponents.TrashView = TrashView;
    }

    // Initialize available components
    try {
      if (availableComponents.MainMenuView) {
        this.viewComponents.set(
          "main-menu",
          new availableComponents.MainMenuView(this.appState, this)
        );
      }
      if (availableComponents.AuthView) {
        this.viewComponents.set(
          "auth",
          new availableComponents.AuthView(this.appState, this)
        );
      }
      if (availableComponents.DashboardView) {
        this.viewComponents.set(
          "dashboard",
          new availableComponents.DashboardView(this.appState, this)
        );
      }
      if (availableComponents.NotesView) {
        this.viewComponents.set(
          "notes",
          new availableComponents.NotesView(this.appState, this)
        );
      }
      if (availableComponents.SettingsView) {
        this.viewComponents.set(
          "settings",
          new availableComponents.SettingsView(this.appState, this)
        );
      }
      if (availableComponents.TrashView) {
        this.viewComponents.set(
          "trash",
          new availableComponents.TrashView(this.appState, this)
        );
      }

      // Initialize all components
      this.viewComponents.forEach((component, name) => {
        if (typeof component.init === "function") {
          try {
            component.init();
            console.log(`✓ ${name} component initialized`);
          } catch (error) {
            console.warn(`⚠️ Failed to initialize ${name} component:`, error);
          }
        }
      });

      console.log(`✅ Initialized ${this.viewComponents.size} view components`);
    } catch (error) {
      console.error("❌ Failed to initialize view components:", error);
    }
  }
  /**
   * Setup state subscription for view changes
   */
  setupStateSubscription() {
    this.appState.subscribe(({ changedKeys, newState }) => {
      if (changedKeys.includes("currentView")) {
        this.handleViewChange(newState.currentView, newState.viewData);
      }
    });
  }

  /**
   * Setup global event handlers
   */
  setupGlobalEventHandlers() {
    // Handle browser back/forward
    window.addEventListener("popstate", (e) => {
      if (e.state && e.state.view) {
        this.showView(e.state.view, e.state.data || {}, false);
      }
    });

    // Handle escape key for modal-like views
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.handleEscapeKey();
      }
    });
  }

  /**
   * Handle view changes from state
   */
  handleViewChange(viewName, viewData = {}) {
    if (!viewName || viewName === this.currentView) return;

    console.log(`🔄 View change: ${this.currentView} → ${viewName}`);
    this.showView(viewName, viewData, true);
  }

  /**
   * Show specified view
   */
  showView(viewName, data = {}, updateHistory = true) {
    const targetElement = this.viewElements.get(viewName);

    if (!targetElement) {
      console.error(`❌ View element not found: ${viewName}`);
      return false;
    }

    // Hide current view
    if (this.currentView) {
      this.hideView(this.currentView);
    }

    // Show target view
    this.displayView(targetElement);

    // Update current view
    const previousView = this.currentView;
    this.currentView = viewName;

    // Call view activation handlers
    this.onViewActivated(viewName, data, previousView);

    // Update browser history
    if (updateHistory) {
      this.updateBrowserHistory(viewName, data);
    }

    // Update document title
    this.updateDocumentTitle(viewName);

    return true;
  }

  /**
   * Hide specified view
   */
  hideView(viewName) {
    const viewElement = this.viewElements.get(viewName);
    if (viewElement) {
      viewElement.classList.add("hidden");

      // Call view deactivation handler
      this.onViewDeactivated(viewName);
    }
  }

  /**
   * Display view element
   */
  displayView(element) {
    // Ensure smooth transition
    element.classList.remove("hidden");

    // Add fade-in animation
    element.style.opacity = "0";
    element.style.transform = "translateY(10px)";

    requestAnimationFrame(() => {
      element.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    });

    // Clean up transition after animation
    setTimeout(() => {
      element.style.transition = "";
      element.style.transform = "";
    }, 300);
  }

  /**
   * Handle view activation
   */
  onViewActivated(viewName, data, previousView) {
    console.log(`✨ View activated: ${viewName}`, data);

    // Call specific view activation handlers
    switch (viewName) {
      case "main-menu":
        this.getViewComponent("main-menu")?.render?.();
        break;

      case "dashboard":
        this.getViewComponent("dashboard")?.onViewActivated?.();
        break;

      case "notes":
        this.getViewComponent("notes")?.onNotesViewActivated?.();
        break;

      case "notes-list":
        this.getViewComponent("notes")?.onNotesListViewActivated?.();
        break;

      case "note-view":
        this.handleNoteViewActivation(data);
        break;

      case "trash":
        this.getViewComponent("trash")?.onViewActivated?.();
        break;

      case "options":
        this.getViewComponent("settings")?.onOptionsViewActivated?.();
        break;

      case "personal-data":
        this.getViewComponent("settings")?.onPersonalDataViewActivated?.();
        break;

      case "change-password":
        this.getViewComponent("settings")?.onChangePasswordViewActivated?.();
        break;
    }

    // Update UI elements based on current view
    this.updateUIForView(viewName, data);
  }

  /**
   * Handle view deactivation
   */
  onViewDeactivated(viewName) {
    console.log(`💫 View deactivated: ${viewName}`);

    // Call cleanup methods if needed
    const component = this.getViewComponent(
      this.getComponentNameForView(viewName)
    );
    if (component && typeof component.cleanup === "function") {
      component.cleanup();
    }
  }

  /**
   * Handle note view activation
   */
  handleNoteViewActivation(data) {
    const state = this.appState.getState();
    const currentTodo = state.currentTodo;

    if (currentTodo) {
      // Update note view with current todo
      this.updateNoteViewDisplay(currentTodo);
    }
  }

  /**
   * Update note view display
   */
  updateNoteViewDisplay(todo) {
    const titleElement = document.getElementById("noteDisplayTitle");
    const contentElement = document.getElementById("noteContentDisplay");
    const statusElement = document.getElementById("noteDisplayStatus");

    if (titleElement) titleElement.textContent = todo.title || "Unbenannt";
    if (contentElement)
      contentElement.textContent = todo.description || "Keine Beschreibung";
    if (statusElement) {
      statusElement.textContent = todo.completed ? "Erledigt" : "Offen";
      statusElement.className = `note-status ${
        todo.completed ? "completed" : "open"
      }`;
    }

    // Update action buttons based on todo state
    this.updateNoteViewActions(todo);
  }

  /**
   * Update note view action buttons
   */
  updateNoteViewActions(todo) {
    const editBtn = document.getElementById("editNoteBtn");
    const deleteBtn = document.getElementById("deleteViewNoteBtn");

    // Disable editing for trashed todos
    if (editBtn) {
      editBtn.disabled = todo.isTrash;
      editBtn.style.opacity = todo.isTrash ? "0.5" : "1";
    }

    // Update delete button text for trashed todos
    if (deleteBtn && todo.isTrash) {
      const btnContent = deleteBtn.querySelector(".btn-content h3");
      if (btnContent) {
        btnContent.textContent = "Endgültig löschen";
      }
    }
  }

  /**
   * Update UI elements for specific view
   */
  updateUIForView(viewName, data) {
    // Update loading state
    this.updateLoadingState(viewName);

    // Update header if needed
    this.updateHeaderForView(viewName);

    // Update navigation state
    this.updateNavigationState(viewName);
  }

  /**
   * Update loading state for view
   */
  updateLoadingState(viewName) {
    const state = this.appState.getState();
    const loadingOverlay = document.getElementById("loadingOverlay");

    if (loadingOverlay) {
      if (state.loading) {
        loadingOverlay.classList.remove("hidden");
      } else {
        loadingOverlay.classList.add("hidden");
      }
    }
  }

  /**
   * Update header for current view
   */
  updateHeaderForView(viewName) {
    const header = document.querySelector(".app-header");
    if (!header) return;

    const subtitle = header.querySelector(".subtitle");
    if (subtitle) {
      switch (viewName) {
        case "dashboard":
          subtitle.textContent = "Deine Todo-Zentrale";
          break;
        case "notes":
          subtitle.textContent = "Todo erstellen oder bearbeiten";
          break;
        case "notes-list":
          subtitle.textContent = "Alle deine Todos im Überblick";
          break;
        case "trash":
          subtitle.textContent = "Gelöschte Todos verwalten";
          break;
        case "options":
          subtitle.textContent = "Einstellungen anpassen";
          break;
        default:
          subtitle.textContent = "Deine Todos, überall verfügbar";
      }
    }
  }

  /**
   * Update navigation state
   */
  updateNavigationState(viewName) {
    // Could update navigation breadcrumbs or active states here
    console.log(`🧭 Navigation state updated for: ${viewName}`);
  }

  /**
   * Update browser history
   */
  updateBrowserHistory(viewName, data) {
    const url = new URL(window.location);
    url.searchParams.set("view", viewName);

    if (data && Object.keys(data).length > 0) {
      url.searchParams.set("data", btoa(JSON.stringify(data)));
    } else {
      url.searchParams.delete("data");
    }

    const state = { view: viewName, data: data };
    history.pushState(state, "", url.toString());
  }

  /**
   * Update document title
   */
  updateDocumentTitle(viewName) {
    const baseTitle = "Let's Todo";
    const viewTitles = {
      "main-menu": "Hauptmenü",
      register: "Registrieren",
      login: "Anmelden",
      dashboard: "Dashboard",
      notes: "Todo bearbeiten",
      "notes-list": "Todo-Liste",
      "note-view": "Todo Details",
      trash: "Papierkorb",
      options: "Einstellungen",
      "personal-data": "Persönliche Daten",
      "change-password": "Passwort ändern",
    };

    const viewTitle = viewTitles[viewName];
    document.title = viewTitle ? `${baseTitle} - ${viewTitle}` : baseTitle;
  }

  /**
   * Handle escape key
   */
  handleEscapeKey() {
    const state = this.appState.getState();

    // Define escape behavior for different views
    const escapeHandlers = {
      register: () => this.appState.navigateToView("main-menu"),
      login: () => this.appState.navigateToView("main-menu"),
      options: () => this.appState.navigateToView("dashboard"),
      "personal-data": () => this.appState.navigateToView("options"),
      "change-password": () => this.appState.navigateToView("personal-data"),
      notes: () => this.appState.navigateBack(),
      "note-view": () => this.appState.navigateToView("notes-list"),
      trash: () => this.appState.navigateToView("dashboard"),
    };

    const handler = escapeHandlers[this.currentView];
    if (handler) {
      handler();
    }
  }

  /**
   * Get view component by name
   */
  getViewComponent(componentName) {
    return this.viewComponents.get(componentName);
  }

  /**
   * Get component name for view
   */
  getComponentNameForView(viewName) {
    const mapping = {
      "main-menu": "main-menu",
      register: "auth",
      login: "auth",
      dashboard: "dashboard",
      notes: "notes",
      "notes-list": "notes",
      "note-view": "notes",
      trash: "trash",
      options: "settings",
      "personal-data": "settings",
      "change-password": "settings",
    };

    return mapping[viewName] || viewName;
  }

  /**
   * Get current view
   */
  getCurrentView() {
    return this.currentView;
  }

  /**
   * Check if view exists
   */
  hasView(viewName) {
    return this.viewElements.has(viewName);
  }

  /**
   * Get view element
   */
  getViewElement(viewName) {
    return this.viewElements.get(viewName);
  }

  /**
   * Cleanup
   */
  cleanup() {
    // Remove event listeners
    window.removeEventListener("popstate", this.handlePopState);
    document.removeEventListener("keydown", this.handleKeyDown);

    // Cleanup view components
    this.viewComponents.forEach((component) => {
      if (typeof component.cleanup === "function") {
        component.cleanup();
      }
    });

    // Clear maps
    this.viewComponents.clear();
    this.viewElements.clear();

    this.isInitialized = false;
    console.log("🧹 Enhanced View Manager cleaned up");
  }
}

// Export for module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = EnhancedViewManager;
}
