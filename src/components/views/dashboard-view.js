/**
 * Dashboard Component
 * Main user dashboard with todo statistics and quick actions
 */

class DashboardView {
  constructor(appState, viewManager) {
    this.appState = appState;
    this.viewManager = viewManager;
    this.elementId = "dashboard";
  }

  /**
   * Initialize dashboard view
   */
  init() {
    this.setupEventListeners();
    this.setupStateSubscription();
    this.render();
  }

  /**
   * Setup event listeners for dashboard buttons
   */
  setupEventListeners() {
    // Notes list button
    const notesListBtn = document.getElementById("notesListDashboardBtn");
    if (notesListBtn) {
      notesListBtn.addEventListener("click", () => this.handleNotesListClick());
    }

    // Create note button
    const createNoteBtn = document.getElementById("createNoteDashboardBtn");
    if (createNoteBtn) {
      createNoteBtn.addEventListener("click", () =>
        this.handleCreateNoteClick()
      );
    }

    // Trash button
    const trashBtn = document.getElementById("trashDashboardBtn");
    if (trashBtn) {
      trashBtn.addEventListener("click", () => this.handleTrashClick());
    }

    // Cancel/Back button
    const cancelBtn = document.getElementById("dashboardCancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.handleBackClick());
    }
  }

  /**
   * Setup state subscription for real-time updates
   */
  setupStateSubscription() {
    this.appState.subscribe(({ changedKeys, newState }) => {
      if (
        changedKeys.includes("todos") ||
        changedKeys.includes("trashedTodos")
      ) {
        this.updateStatistics(newState);
      }
    });
  }

  /**
   * Render dashboard content
   */
  render() {
    const element = document.querySelector(`[data-view="${this.elementId}"]`);
    if (!element) return;

    const state = this.appState.getState();
    this.updateStatistics(state);
    this.updateWelcomeMessage(state);
  }

  /**
   * Update dashboard statistics
   */
  updateStatistics(state) {
    const todos = state.todos || [];
    const trashedTodos = state.trashedTodos || [];

    // Calculate statistics
    const totalTodos = todos.length;
    const completedTodos = todos.filter((todo) => todo.completed).length;
    const trashCount = trashedTodos.length;

    // Update DOM elements
    this.updateStatElement(".dashboard-total-notes", totalTodos);
    this.updateStatElement(".dashboard-completed-notes", completedTodos);
    this.updateStatElement(".dashboard-trash-count", trashCount);

    // Add progress information
    this.updateProgressInfo(totalTodos, completedTodos);
  }

  /**
   * Update individual stat element
   */
  updateStatElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      // Animate number change
      this.animateNumber(element, parseInt(element.textContent) || 0, value);
    }
  }

  /**
   * Animate number changes
   */
  animateNumber(element, from, to) {
    const duration = 500;
    const steps = 20;
    const increment = (to - from) / steps;
    let current = from;
    let step = 0;

    const animate = () => {
      if (step < steps) {
        current += increment;
        element.textContent = Math.round(current);
        step++;
        requestAnimationFrame(animate);
      } else {
        element.textContent = to;
      }
    };

    if (from !== to) {
      animate();
    }
  }

  /**
   * Update progress information
   */
  updateProgressInfo(total, completed) {
    let progressText = "";
    let progressClass = "";

    if (total === 0) {
      progressText = "Erstelle dein erstes Todo!";
      progressClass = "empty";
    } else if (completed === total) {
      progressText = "Alle Todos erledigt! 🎉";
      progressClass = "complete";
    } else {
      const percentage = Math.round((completed / total) * 100);
      progressText = `${percentage}% erledigt`;
      progressClass = "progress";
    }

    // Update progress display (create if doesn't exist)
    this.updateProgressDisplay(progressText, progressClass);
  }

  /**
   * Update progress display element
   */
  updateProgressDisplay(text, className) {
    let progressElement = document.querySelector(".dashboard-progress");

    if (!progressElement) {
      progressElement = document.createElement("div");
      progressElement.className = "dashboard-progress";

      const statsSection = document.querySelector(".dashboard-stats");
      if (statsSection) {
        statsSection.appendChild(progressElement);
      }
    }

    progressElement.textContent = text;
    progressElement.className = `dashboard-progress ${className}`;
  }

  /**
   * Update welcome message based on user session
   */
  updateWelcomeMessage(state) {
    const introSection = document.querySelector(".dashboard-intro p");
    if (!introSection) return;

    let message = "Willkommen in deiner Todo-Übersicht.";

    if (state.sessionType === "guest") {
      message = "Willkommen, Gast! Deine Todos werden lokal gespeichert.";
    } else if (state.sessionType === "user" && state.userEmail) {
      const name = state.userEmail.split("@")[0];
      message = `Willkommen zurück, ${name}! Hier sind deine Todos.`;
    }

    introSection.textContent = message;
  }

  /**
   * Event handlers
   */
  handleNotesListClick() {
    this.appState.navigateToView("notes-list");
  }

  handleCreateNoteClick() {
    // Clear any existing current todo
    this.appState.setState({ currentTodo: null });
    this.appState.navigateToView("notes");
  }

  handleTrashClick() {
    this.appState.navigateToView("trash");
  }

  handleBackClick() {
    const state = this.appState.getState();

    if (state.sessionType) {
      // If logged in, show logout option
      this.showLogoutConfirmation();
    } else {
      this.appState.navigateToView("main-menu");
    }
  }

  /**
   * Show logout confirmation
   */
  showLogoutConfirmation() {
    const shouldLogout = confirm("Möchten Sie sich abmelden?");

    if (shouldLogout) {
      this.handleLogout();
    }
  }

  /**
   * Handle user logout
   */
  handleLogout() {
    // Clear session through SessionManager
    if (window.todoApp && window.todoApp.sessionManager) {
      window.todoApp.sessionManager.reset();
    }

    // Clear app state
    this.appState.setState({
      sessionType: null,
      userId: null,
      userEmail: null,
      sessionId: null,
      todos: [],
      trashedTodos: [],
      currentTodo: null,
    });

    this.appState.addNotification({
      type: "success",
      message: "Erfolgreich abgemeldet",
    });

    this.appState.navigateToView("main-menu");
  }

  /**
   * Load fresh data when view becomes active
   */
  onViewActivated() {
    // Refresh todos when dashboard becomes active
    if (window.todoApp && window.todoApp.todoService) {
      window.todoApp.todoService.loadTodos();
    }
  }

  /**
   * Cleanup when leaving view
   */
  cleanup() {
    console.log("DashboardView cleanup");
  }
}

// Export for module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = DashboardView;
}
