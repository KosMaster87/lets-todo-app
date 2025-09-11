/**
 * Central Application State Management
 * Manages all app state and notifies subscribers about changes
 * @constructor
 */
function AppState() {
  // Default application state
  this.state = {
    // UI State
    currentView: "main-menu", // Current active view
    previousView: null, // For navigation back functionality
    loading: false, // Global loading state
    error: null, // Global error message

    // Session State
    sessionType: null, // "guest", "user", null
    sessionId: null, // Guest session ID or user session
    userId: null, // User ID (null for guests)
    userEmail: null, // User email (null for guests)

    // Data State
    todos: [], // All todos cache
    currentTodo: null, // Currently selected/editing todo
    trashedTodos: [], // Deleted todos (trash functionality)

    // UI-specific States
    todoListFilter: "all", // "all", "completed", "pending"
    formMode: "create", // "create", "edit"
    sortOrder: "created", // "created", "title", "updated"
    sortDirection: "desc", // "asc", "desc"

    // Form States
    formData: {}, // Current form data
    formErrors: {}, // Form validation errors

    // Notification State
    notifications: [], // Toast notifications queue

    // Theme State
    theme: "light", // "light", "dark"
  };

  // Subscribers array for state change notifications
  this.subscribers = [];

  /**
   * Update state and notify subscribers
   * @param {Object} newState - Partial state to merge
   * @param {boolean} silent - Skip notifications if true
   */
  this.setState = function (newState, silent = false) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };

    if (!silent) {
      // Get changed keys for optimized updates
      const changedKeys = this.getChangedKeys(oldState, this.state);
      if (changedKeys.length > 0) {
        this.notifySubscribers(changedKeys, oldState, this.state);
      }
    }
  };

  /**
   * Get current state (immutable copy)
   * @returns {Object} Current application state
   */
  this.getState = function () {
    return { ...this.state };
  };

  /**
   * Subscribe to state changes
   * @param {Function} callback - Callback function to call on state change
   * @returns {Function} Unsubscribe function
   */
  this.subscribe = function (callback) {
    this.subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  };

  /**
   * Get keys that changed between old and new state
   * @private
   */
  this.getChangedKeys = function (oldState, newState) {
    const changedKeys = [];
    for (const key in newState) {
      if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
        changedKeys.push(key);
      }
    }
    return changedKeys;
  };

  /**
   * Notify all subscribers about state changes
   * @private
   */
  this.notifySubscribers = function (changedKeys, oldState, newState) {
    this.subscribers.forEach((callback) => {
      try {
        callback({
          changedKeys,
          oldState: { ...oldState },
          newState: { ...newState },
          currentState: this.state,
        });
      } catch (error) {
        console.error("Error in state subscriber:", error);
      }
    });
  };

  /**
   * Reset state to initial values
   */
  this.reset = function () {
    this.setState({
      currentView: "main-menu",
      previousView: null,
      loading: false,
      error: null,
      sessionType: null,
      sessionId: null,
      userId: null,
      userEmail: null,
      todos: [],
      currentTodo: null,
      trashTodos: [],
      todoListFilter: "all",
      formMode: "create",
      sortOrder: "created",
      sortDirection: "desc",
      formData: {},
      formErrors: {},
      notifications: [],
    });
  };

  /**
   * Add a notification to the queue
   * @param {Object} notification - Notification object
   */
  this.addNotification = function (notification) {
    const notifications = [...this.state.notifications];
    notifications.push({
      id: Date.now(),
      type: "info",
      message: "",
      duration: 3000,
      ...notification,
    });
    this.setState({ notifications });
  };

  /**
   * Remove a notification by ID
   * @param {number} id - Notification ID
   */
  this.removeNotification = function (id) {
    const notifications = this.state.notifications.filter((n) => n.id !== id);
    this.setState({ notifications });
  };

  /**
   * Clear all notifications
   */
  this.clearNotifications = function () {
    this.setState({ notifications: [] });
  };

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  this.setLoading = function (loading) {
    this.setState({ loading });
  };

  /**
   * Set error state
   * @param {string|null} error - Error message or null to clear
   */
  this.setError = function (error) {
    this.setState({ error });
  };

  /**
   * Navigate to a new view
   * @param {string} viewName - Target view name
   * @param {Object} data - Optional data for the view
   */
  this.navigateToView = function (viewName, data = {}) {
    const previousView = this.state.currentView;
    this.setState({
      currentView: viewName,
      previousView,
      ...data,
    });
  };

  /**
   * Navigate back to previous view
   */
  this.navigateBack = function () {
    if (this.state.previousView) {
      const targetView = this.state.previousView;
      this.setState({
        currentView: targetView,
        previousView: null,
      });
    } else {
      // Fallback to main menu
      this.setState({
        currentView: "main-menu",
        previousView: null,
      });
    }
  };
}

// Export for use in other modules
if (typeof window !== "undefined") {
  window.AppState = AppState;
}
