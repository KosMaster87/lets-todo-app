/**
 * Event-Handler Modul
 * Zentrale Sammlung aller Event-Handler für UI-Interaktionen
 */

"use strict";

const EventHandlers = {
  /**
   * Auth-Button Event-Handler Setup
   * @param {HTMLElement} container - Container-Element
   * @param {Object} app - App-Instanz mit Methoden
   */
  setupAuthButtons: function (container, app) {
    container.querySelector("#btn-login").addEventListener("click", () => {
      app.printLoginForm();
    });

    container.querySelector("#btn-register").addEventListener("click", () => {
      app.printRegisterForm();
    });

    container.querySelector("#btn-guest").addEventListener("click", () => {
      app.apiClient
        .startGuestSession()
        .then(() => {
          app.sessionManager.guestStarted = true;
          app.sessionManager.userLoggedIn = false;
          app.mode = "list";
          app.init();
        })
        .catch(console.error);
    });
  },

  /**
   * Login-Form Event-Handler Setup
   * @param {HTMLElement} container - Container-Element
   * @param {Object} app - App-Instanz
   */
  setupLoginForm: function (container, app) {
    container.querySelector("#login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const email = container.querySelector("#login-email").value;
      const password = container.querySelector("#login-password").value;

      app.apiClient
        .login(email, password)
        .then(() => {
          app.sessionManager.userLoggedIn = true;
          app.sessionManager.guestStarted = false;
          app.mode = "list";
          app.init();
        })
        .catch(() => alert("Login fehlgeschlagen"));
    });

    container
      .querySelector("#btn-login-cancel")
      .addEventListener("click", () => app.init());
  },

  /**
   * Register-Form Event-Handler Setup
   * @param {HTMLElement} container - Container-Element
   * @param {Object} app - App-Instanz
   */
  setupRegisterForm: function (container, app) {
    container
      .querySelector("#register-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const email = container.querySelector("#register-email").value;
        const password = container.querySelector("#register-password").value;

        app.apiClient
          .register(email, password)
          .then(() => {
            alert("Registrierung erfolgreich! Jetzt einloggen.");
            app.printLoginForm();
          })
          .catch((err) => {
            console.error("Registrierung fehlgeschlagen:", err);
          });
      });

    container
      .querySelector("#btn-register-cancel")
      .addEventListener("click", () => app.init());
  },

  /**
   * Logout-Button Event-Handler Setup
   * @param {HTMLElement} container - Container-Element
   * @param {Object} app - App-Instanz
   */
  setupLogoutButton: function (container, app) {
    container.querySelector("#btn-logout").addEventListener("click", () => {
      app.apiClient.logout().then(() => {
        app.sessionManager.reset();
        app.mode = "guest";
        app.init();
      });
    });
  },

  /**
   * Gast-Info Buttons Event-Handler Setup
   * @param {HTMLElement} container - Container-Element
   * @param {Object} app - App-Instanz
   */
  setupGuestButtons: function (container, app) {
    container
      .querySelector("#btn-register-from-guest")
      .addEventListener("click", () => {
        app.printRegisterForm();
      });

    container.querySelector("#btn-end-guest").addEventListener("click", () => {
      app.apiClient
        .endGuestSession()
        .then(() => {
          app.sessionManager.reset();
          app.mode = "guest";
          app.init();
        })
        .catch(console.error);
    });
  },

  /**
   * Todo-Buttons Event-Handler Setup
   * @param {HTMLElement} container - Container-Element
   * @param {Object} app - App-Instanz
   */
  setupTodoButtons: function (container, app) {
    const addButton = container.querySelector("#btn-todo-add");
    if (addButton) {
      addButton.addEventListener("click", (e) => {
        e.preventDefault();
        app.resetCurrentTodo();
        app.changeMode("form");
      });
    }

    const backButton = container.querySelector("#btn-todo-back");
    if (backButton) {
      backButton.addEventListener("click", (e) => {
        e.preventDefault();
        app.resetCurrentTodo();
        app.changeMode("list");
      });
    }
  },

  /**
   * Todo-Item Event-Handler Setup
   * @param {HTMLElement} container - Container-Element
   * @param {Object} todo - Todo-Objekt
   * @param {Object} app - App-Instanz
   */
  setupTodoItemHandlers: function (container, todo, app) {
    // Checkbox-Handler
    container
      .querySelector(`#todo-${todo.id}-check`)
      .addEventListener("change", (e) => {
        e.preventDefault();
        const updateData = { completed: e.target.checked ? 1 : 0 };

        app.apiClient.updateTodo(todo.id, updateData).then(() => {
          container
            .querySelector(`#todo-${todo.id}-check-label`)
            .classList.toggle("todo-item-completed", e.target.checked);
        });
      });

    // Edit-Handler
    container
      .querySelector(`#note-edit-${todo.id}`)
      .addEventListener("click", () => {
        app.apiClient.getTodo(todo.id).then((json) => {
          app.currentTodo = json;
          app.changeMode("form");
        });
      });

    // Delete-Handler
    container
      .querySelector(`#note-delete-${todo.id}`)
      .addEventListener("click", () => {
        app.apiClient.deleteTodo(todo.id).then(() => {
          container.querySelector(`#todo-item-${todo.id}`).remove();
        });
      });
  },

  /**
   * Todo-Form Event-Handler Setup
   * @param {HTMLElement} container - Container-Element
   * @param {Object} app - App-Instanz
   */
  setupTodoForm: function (container, app) {
    container
      .querySelector("#btn-todo-submit")
      .addEventListener("click", (e) => {
        app.saveTodoHandler(e);
      });

    const submitNextBtn = container.querySelector("#todo-submit-next");
    if (submitNextBtn) {
      submitNextBtn.addEventListener("click", (e) => {
        app.saveTodoHandler(e, "next");
      });
    }
  },
};

// Global verfügbar machen
window.EventHandlers = EventHandlers;
