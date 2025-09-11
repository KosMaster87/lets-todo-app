/**
 * Trash Management Component
 * Handles deleted todos, restore functionality, and permanent deletion
 */

class TrashView {
  constructor(appState, viewManager) {
    this.appState = appState;
    this.viewManager = viewManager;
    this.elementId = "trash";
    this.currentFilter = "all"; // all, recent, old
  }

  /**
   * Initialize trash view
   */
  init() {
    this.setupEventListeners();
    this.setupStateSubscription();
    this.render();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Empty trash button
    const emptyTrashBtn = document.getElementById("emptyTrashBtn");
    if (emptyTrashBtn) {
      emptyTrashBtn.addEventListener("click", () => this.handleEmptyTrash());
    }

    // Filter button
    const filterBtn = document.getElementById("trashFilterBtn");
    if (filterBtn) {
      filterBtn.addEventListener("click", () => this.handleFilterToggle());
    }

    // Cancel button
    const cancelBtn = document.getElementById("trashCancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.handleCancel());
    }

    // Dynamic event delegation for trash items
    document.addEventListener("click", (e) => this.handleDynamicEvents(e));
  }

  /**
   * Setup state subscription for real-time updates
   */
  setupStateSubscription() {
    this.appState.subscribe(({ changedKeys, newState }) => {
      if (changedKeys.includes("trashedTodos")) {
        this.renderTrashList(newState.trashedTodos);
        this.updateTrashStats(newState.trashedTodos);
      }
    });
  }

  /**
   * Handle dynamic events for trash items
   */
  handleDynamicEvents(e) {
    const action = e.target.dataset.action;
    const todoId = e.target.dataset.id;

    if (action && todoId && this.isInTrashView()) {
      switch (action) {
        case "restore":
          this.restoreTodo(parseInt(todoId));
          break;
        case "delete-permanent":
          this.deleteTodoPermanently(parseInt(todoId));
          break;
        case "view":
          this.viewTrashedTodo(parseInt(todoId));
          break;
      }
    }
  }

  /**
   * Check if currently in trash view
   */
  isInTrashView() {
    const trashElement = document.querySelector('[data-view="trash"]');
    return trashElement && !trashElement.classList.contains("hidden");
  }

  /**
   * Render trash view
   */
  render() {
    const state = this.appState.getState();
    // Safe access to trashedTodos with fallback to empty array
    const trashedTodos = state.trashedTodos || [];
    this.renderTrashList(trashedTodos);
    this.updateTrashStats(trashedTodos);
  }

  /**
   * Render trash list
   */
  renderTrashList(trashedTodos) {
    const listContainer = document.querySelector(".trash-notes-list");
    if (!listContainer) return;

    // Ensure trashedTodos is an array
    const safeTrashTodos = Array.isArray(trashedTodos) ? trashedTodos : [];

    if (safeTrashTodos.length === 0) {
      listContainer.innerHTML = `
        <div class="trash-note-placeholder">
          <p>Papierkorb ist leer</p>
          <p><small>Gelöschte Todos erscheinen hier und können wiederhergestellt werden.</small></p>
        </div>
      `;
      return;
    }

    // Apply current filter
    const filteredTodos = this.applyFilter(trashedTodos);

    if (filteredTodos.length === 0) {
      listContainer.innerHTML = `
        <div class="trash-note-placeholder">
          <p>Keine Todos entsprechen dem aktuellen Filter</p>
        </div>
      `;
      return;
    }

    const todosHtml = filteredTodos
      .map((todo) => this.renderTrashedTodoItem(todo))
      .join("");
    listContainer.innerHTML = todosHtml;
  }

  /**
   * Apply filter to trashed todos
   */
  applyFilter(trashedTodos, filterType) {
    // Ensure trashedTodos is an array
    const safeTodos = Array.isArray(trashedTodos) ? trashedTodos : [];

    if (filterType === "all" || !filterType) {
      return safeTodos;
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return safeTodos.filter((todo) => {
      if (!todo.deletedAt) return false;

      const deletedAt = new Date(todo.deletedAt);

      switch (filterType) {
        case "recent":
          return deletedAt >= oneDayAgo;
        case "old":
          return deletedAt < oneWeekAgo;
        default:
          return true;
      }
    });
  }

  /**
   * Render individual trashed todo item
   */
  renderTrashedTodoItem(todo) {
    const deletedDate = this.formatDate(todo.deleted_at || todo.updated_at);
    const daysSinceDeleted = this.getDaysSinceDeleted(
      todo.deleted_at || todo.updated_at
    );

    return `
      <div class="trash-todo-item" data-id="${todo.id}">
        <div class="trash-todo-content">
          <h4 class="trash-todo-title">${this.escapeHtml(todo.title)}</h4>
          <p class="trash-todo-description">${this.escapeHtml(
            todo.description?.substring(0, 80) || ""
          )}${todo.description?.length > 80 ? "..." : ""}</p>
          <div class="trash-todo-meta">
            <span class="trash-date">Gelöscht: ${deletedDate}</span>
            <span class="trash-age">${daysSinceDeleted}</span>
          </div>
        </div>
        <div class="trash-todo-actions">
          <button class="action-btn restore-btn" data-action="restore" data-id="${
            todo.id
          }" title="Wiederherstellen">
            <div class="action-icon restore-icon"></div>
          </button>
          <button class="action-btn view-btn" data-action="view" data-id="${
            todo.id
          }" title="Ansehen">
            <div class="action-icon view-icon"></div>
          </button>
          <button class="action-btn delete-permanent-btn" data-action="delete-permanent" data-id="${
            todo.id
          }" title="Endgültig löschen">
            <div class="action-icon delete-permanent-icon"></div>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Update trash statistics
   */
  updateTrashStats(trashedTodos) {
    const statsContainer = this.getOrCreateStatsContainer();

    // Ensure trashedTodos is an array
    const safeTodos = Array.isArray(trashedTodos) ? trashedTodos : [];
    const count = safeTodos.length;

    // Calculate statistics with safe access
    const recentCount = this.applyFilter(safeTodos, "recent").length;
    const oldCount = this.applyFilter(safeTodos, "old").length;

    statsContainer.innerHTML = `
      <div class="trash-stats">
        <div class="stat-item">
          <span class="stat-number">${count}</span>
          <span class="stat-label">Gelöschte Todos</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${recentCount}</span>
          <span class="stat-label">Letzte 24h</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${oldCount}</span>
          <span class="stat-label">Älter als 1 Woche</span>
        </div>
      </div>
      ${
        count === 0
          ? `
        <div style="text-align: center; margin-top: 1rem; color: #666; font-size: 0.9rem;">
          <p>🗑️ Trash-Funktionalität wird implementiert</p>
          <p><small>Momentan werden gelöschte Todos permanent entfernt.</small></p>
        </div>
      `
          : ""
      }
    `;
  }

  /**
   * Get or create stats container
   */
  getOrCreateStatsContainer() {
    let statsContainer = document.querySelector(".trash-stats-container");

    if (!statsContainer) {
      statsContainer = document.createElement("div");
      statsContainer.className = "trash-stats-container";

      const trashContainer = document.querySelector(".trash-notes-container");
      if (trashContainer) {
        trashContainer.insertBefore(statsContainer, trashContainer.firstChild);
      }
    }

    return statsContainer;
  }

  /**
   * Handle empty trash
   */
  handleEmptyTrash() {
    const state = this.appState.getState();
    const trashedTodos = state.trashedTodos || [];

    if (trashedTodos.length === 0) {
      this.appState.addNotification({
        type: "info",
        message: "Papierkorb ist bereits leer",
      });
      return;
    }

    const confirmMessage = `Papierkorb wirklich leeren? Alle ${trashedTodos.length} Todos werden endgültig gelöscht und können nicht wiederhergestellt werden.`;

    if (confirm(confirmMessage)) {
      this.emptyTrash();
    }
  }

  /**
   * Empty trash
   */
  emptyTrash() {
    if (window.todoApp && window.todoApp.todoService) {
      window.todoApp.todoService
        .emptyTrash()
        .then(() => {
          this.appState.addNotification({
            type: "success",
            message: "Papierkorb wurde geleert",
          });
        })
        .catch((error) => {
          this.appState.addNotification({
            type: "error",
            message: "Fehler beim Leeren des Papierkorbs",
          });
        });
    }
  }

  /**
   * Handle filter toggle
   */
  handleFilterToggle() {
    const filters = ["all", "recent", "old"];
    const currentIndex = filters.indexOf(this.currentFilter);
    const nextIndex = (currentIndex + 1) % filters.length;

    this.currentFilter = filters[nextIndex];

    // Update filter button text
    this.updateFilterButtonText();

    // Re-render list with new filter
    const state = this.appState.getState();
    this.renderTrashList(state.trashedTodos);

    this.appState.addNotification({
      type: "info",
      message: `Filter: ${this.getFilterDisplayName()}`,
    });
  }

  /**
   * Update filter button text
   */
  updateFilterButtonText() {
    const filterBtn = document.getElementById("trashFilterBtn");
    if (!filterBtn) return;

    const btnContent = filterBtn.querySelector(".btn-content h3");
    const btnDescription = filterBtn.querySelector(".btn-content p");

    if (btnContent && btnDescription) {
      const filterName = this.getFilterDisplayName();
      btnContent.textContent = `Filter: ${filterName}`;
      btnDescription.textContent = this.getFilterDescription();
    }
  }

  /**
   * Get filter display name
   */
  getFilterDisplayName() {
    switch (this.currentFilter) {
      case "recent":
        return "Kürzlich gelöscht";
      case "old":
        return "Älter";
      case "all":
      default:
        return "Alle";
    }
  }

  /**
   * Get filter description
   */
  getFilterDescription() {
    switch (this.currentFilter) {
      case "recent":
        return "Letzte 24 Stunden";
      case "old":
        return "Älter als 1 Woche";
      case "all":
      default:
        return "Alle gelöschten Todos anzeigen";
    }
  }

  /**
   * Restore todo
   */
  restoreTodo(todoId) {
    if (window.todoApp && window.todoApp.todoService) {
      window.todoApp.todoService
        .restoreTodo(todoId)
        .then(() => {
          this.appState.addNotification({
            type: "success",
            message: "Todo erfolgreich wiederhergestellt",
          });
        })
        .catch((error) => {
          this.appState.addNotification({
            type: "error",
            message: "Fehler beim Wiederherstellen des Todos",
          });
        });
    }
  }

  /**
   * Delete todo permanently
   */
  deleteTodoPermanently(todoId) {
    const confirmMessage =
      "Todo endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.";

    if (confirm(confirmMessage)) {
      if (window.todoApp && window.todoApp.todoService) {
        window.todoApp.todoService
          .deleteTodoPermanently(todoId)
          .then(() => {
            this.appState.addNotification({
              type: "success",
              message: "Todo endgültig gelöscht",
            });
          })
          .catch((error) => {
            this.appState.addNotification({
              type: "error",
              message: "Fehler beim endgültigen Löschen",
            });
          });
      }
    }
  }

  /**
   * View trashed todo (read-only)
   */
  viewTrashedTodo(todoId) {
    const state = this.appState.getState();
    const trashedTodos = state.trashedTodos || [];
    const todo = trashedTodos.find((t) => t.id === todoId);

    if (todo) {
      // Set as current todo and navigate to read-only view
      this.appState.setState({
        currentTodo: { ...todo, isTrash: true },
      });
      this.appState.navigateToView("note-view");
    }
  }

  /**
   * Handle cancel/back
   */
  handleCancel() {
    this.appState.navigateToView("dashboard");
  }

  /**
   * Utility functions
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getDaysSinceDeleted(dateString) {
    const deletedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - deletedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Heute";
    if (diffDays === 1) return "Gestern";
    if (diffDays < 7) return `${diffDays} Tage`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} Wochen`;
    return `${Math.floor(diffDays / 30)} Monate`;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * View activation handler
   */
  onViewActivated() {
    // Load fresh trashed todos when view becomes active
    if (window.todoApp && window.todoApp.todoService) {
      window.todoApp.todoService.loadTrashedTodos();
    }

    // Reset filter
    this.currentFilter = "all";
    this.updateFilterButtonText();
  }

  /**
   * Cleanup
   */
  cleanup() {
    console.log("TrashView cleanup");
  }
}

// Export for module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = TrashView;
}
