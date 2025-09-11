/**
 * Main Menu Component
 * Handles the main navigation and initial user choices
 */

class MainMenuView {
  constructor(appState, viewManager) {
    this.appState = appState;
    this.viewManager = viewManager;
    this.elementId = "main-menu";
  }

  /**
   * Initialize main menu view
   */
  init() {
    this.setupEventListeners();
    this.render();
  }

  /**
   * Setup event listeners for main menu buttons
   */
  setupEventListeners() {
    // Guest session button
    const guestBtn = document.getElementById("guestBtn");
    if (guestBtn) {
      guestBtn.addEventListener("click", () => this.handleGuestSession());
    }

    // Register button
    const registerBtn = document.getElementById("registerBtn");
    if (registerBtn) {
      registerBtn.addEventListener("click", () => this.handleRegister());
    }

    // Login button
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => this.handleLogin());
    }

    // Options button
    const optionBtn = document.getElementById("optionBtn");
    if (optionBtn) {
      optionBtn.addEventListener("click", () => this.handleOptions());
    }
  }

  /**
   * Render main menu content
   */
  render() {
    const element = document.querySelector(`[data-view="${this.elementId}"]`);
    if (!element) return;

    // Update dynamic content based on state
    const state = this.appState.getState();

    // Show different options based on session state
    if (state.sessionType) {
      this.showLoggedInState();
    } else {
      this.showLoggedOutState();
    }
  }

  /**
   * Show options for logged-in users
   */
  showLoggedInState() {
    const guestBtn = document.getElementById("guestBtn");
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");

    if (guestBtn) guestBtn.style.display = "none";
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
  }

  /**
   * Show options for logged-out users
   */
  showLoggedOutState() {
    const guestBtn = document.getElementById("guestBtn");
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");

    if (guestBtn) guestBtn.style.display = "flex";
    if (loginBtn) loginBtn.style.display = "flex";
    if (registerBtn) registerBtn.style.display = "flex";
  }

  /**
   * Handle guest session start
   */
  handleGuestSession() {
    this.appState.addNotification({
      type: "info",
      message: "Starte Gast-Session...",
    });

    // Trigger guest session through app
    if (window.todoApp) {
      window.todoApp.startGuestSession();
    }
  }

  /**
   * Handle register navigation
   */
  handleRegister() {
    this.appState.navigateToView("register");
  }

  /**
   * Handle login navigation
   */
  handleLogin() {
    this.appState.navigateToView("login");
  }

  /**
   * Handle options navigation
   */
  handleOptions() {
    this.appState.navigateToView("options");
  }

  /**
   * Cleanup when leaving view
   */
  cleanup() {
    // Remove event listeners if needed
    console.log("MainMenuView cleanup");
  }
}

// Export for module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = MainMenuView;
}
