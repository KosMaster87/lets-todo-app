/**
 * UI-Renderer Modul
 * Zentrale UI-Rendering Funktionen für saubere Trennung von Logic und Presentation
 */

"use strict";

const UIRenderer = {
  /**
   * Authentifizierungs-Optionen rendern
   * @param {HTMLElement} container - Container-Element
   * @param {Object} app - App-Instanz für Event-Handler
   */
  renderAuthOptions: function (container, app) {
    container.insertAdjacentHTML("beforeend", HTMLTemplates.authOptions());
    EventHandlers.setupAuthButtons(container, app);
  },

  /**
   * Login-Formular rendern
   * @param {HTMLElement} container - Container-Element
   * @param {Object} app - App-Instanz für Event-Handler
   */
  renderLoginForm: function (container, app) {
    container.innerHTML = HTMLTemplates.loginForm();
    EventHandlers.setupLoginForm(container, app);
  },

  /**
   * Registrierungs-Formular rendern
   * @param {HTMLElement} container - Container-Element
   * @param {Object} app - App-Instanz für Event-Handler
   */
  renderRegisterForm: function (container, app) {
    container.innerHTML = HTMLTemplates.registerForm();
    EventHandlers.setupRegisterForm(container, app);
  },

  /**
   * Logout-Button rendern
   * @param {HTMLElement} container - Container-Element
   * @param {Object} app - App-Instanz für Event-Handler
   */
  renderLogoutButton: function (container, app) {
    container.insertAdjacentHTML("afterbegin", HTMLTemplates.logoutButton());
    EventHandlers.setupLogoutButton(container, app);
  },

  /**
   * Gast-Info rendern
   * @param {HTMLElement} container - Container-Element
   * @param {Object} app - App-Instanz für Event-Handler
   */
  renderGuestInfo: function (container, app) {
    container.insertAdjacentHTML("beforeend", HTMLTemplates.guestInfo());
    EventHandlers.setupGuestButtons(container, app);
  },

  /**
   * Modus-abhängige Action-Buttons rendern
   * @param {HTMLElement} container - Container-Element
   * @param {string} mode - Aktueller UI-Modus
   * @param {Object} app - App-Instanz für Event-Handler
   */
  renderModeButtons: function (container, mode, app) {
    if (mode === "list") {
      container.insertAdjacentHTML("beforeend", HTMLTemplates.addTodoButton());
    } else if (mode === "form") {
      container.insertAdjacentHTML("beforeend", HTMLTemplates.backButton());
    }
    EventHandlers.setupTodoButtons(container, app);
  },

  /**
   * Einzelnes Todo-Item rendern
   * @param {HTMLElement} container - Container-Element
   * @param {Object} todo - Todo-Objekt
   * @param {Object} app - App-Instanz für Event-Handler
   */
  renderTodoItem: function (container, todo, app) {
    container.insertAdjacentHTML("beforeend", HTMLTemplates.todoItem(todo));
    EventHandlers.setupTodoItemHandlers(container, todo, app);
  },

  /**
   * Todo-Formular rendern
   * @param {HTMLElement} container - Container-Element
   * @param {Object} currentTodo - Aktuelles Todo-Objekt
   * @param {Object} app - App-Instanz für Event-Handler
   */
  renderTodoForm: function (container, currentTodo, app) {
    container.insertAdjacentHTML(
      "beforeend",
      HTMLTemplates.todoForm(currentTodo)
    );
    EventHandlers.setupTodoForm(container, app);

    // Live-Validierung aktivieren
    if (window.setupFormValidation) {
      setupFormValidation(
        container.querySelector("#todo-title"),
        container.querySelector("#btn-todo-submit"),
        currentTodo.id === 0
          ? container.querySelector("#todo-submit-next")
          : null
      );
    }
  },
};

// Global verfügbar machen
window.UIRenderer = UIRenderer;