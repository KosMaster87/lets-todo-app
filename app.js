/**
 * Todo-App Frontend - Haupt-Anwendung (Refactored)
 * Features:
 * - Session-basierte Authentifizierung (User/Gast)
 * - RESTful API-Kommunikation
 * - Dynamisches UI-Rendering
 */

"use strict";

/**
 * Todo-App Hauptklasse (als Function Constructor)
 * Verwaltet UI-Status und koordiniert SessionManager + ApiClient
 * @constructor
 */
function todoApp() {
  /** @type {HTMLElement} Container-Element für das UI */
  this.container = "";

  /** @type {string} Aktueller UI-Modus: "guest", "list", "form" */
  this.mode = "guest";

  /** @type {Object} Aktuell bearbeitetes Todo */
  this.currentTodo = {};

  /** @type {SessionManager} Session-Management */
  this.sessionManager = new SessionManager();

  /** @type {ApiClient} API-Client */
  this.apiClient = new ApiClient();

  /**
   * App-Initialisierung
   */
  this.init = function () {
    this.container = document.querySelector("#content");
    this.container.innerHTML = "";

    // Error-Handler für API-Client registrieren
    this.apiClient.setErrorHandler((msg) => this.showError(msg));

    console.log("🚀 App-Start: Session-Validierung...");

    // Session über SessionManager validieren
    this.sessionManager
      .validateSession((url, method, data) =>
        this.apiClient.request(url, method, data)
      )
      .then((response) => {
        console.log("Session-Validierung Antwort:", response);

        // Modus basierend auf Session setzen
        if (response.valid) {
          this.mode = this.mode === "guest" ? "list" : this.mode;
        } else {
          this.mode = "guest";
        }

        this.buildUI();
      })
      .catch(() => {
        this.sessionManager.reset();
        this.mode = "guest";
        this.buildUI();
      });
  };

  /**
   * UI aufbauen
   */
  this.buildUI = function () {
    this.container.innerHTML = "";

    // Session-Info über SessionManager anzeigen
    const sessionInfoHTML = this.sessionManager.getSessionInfoHTML();
    if (sessionInfoHTML) {
      this.container.insertAdjacentHTML("beforeend", sessionInfoHTML);
    }

    // UI basierend auf Session-Status
    if (
      !this.sessionManager.isUserLoggedIn() &&
      !this.sessionManager.isGuestStarted()
    ) {
      this.mode = "guest";
      this.printAuthOptions();
    } else if (this.sessionManager.isUserLoggedIn()) {
      if (this.mode === "guest") this.mode = "list";
      this.printLogout();
      this.printModeContent();
    } else if (this.sessionManager.isGuestStarted()) {
      if (this.mode === "guest") this.mode = "list";
      this.printGuestInfo();
      this.printModeContent();
    }
  };

  /**
   * Modus-abhängigen Content anzeigen
   */
  this.printModeContent = function () {
    if (this.mode === "list") {
      this.printBtn();
      this.loadAndDisplayTodos();
    } else if (this.mode === "form") {
      this.printBtn();
      this.printForm();
    }
  };

  /**
   * Todos laden und anzeigen (verwendet ApiClient)
   */
  this.loadAndDisplayTodos = function () {
    this.apiClient
      .getAllTodos()
      .then((todos) => {
        todos.forEach((todo) => this.printTodo(todo));
      })
      .catch(console.error);
  };

  /**
   * Gast-spezifische UI-Elemente rendern
   */
  this.printGuestInfo = function () {
    const html = `
      <div style="text-align:right; margin-bottom:1rem;">
        <button class="btn-todo btn-register-from-guest" id="btn-register-from-guest" style="font-size:0.8rem;">Account erstellen</button>
        <button class="btn-todo btn-end-guest" id="btn-end-guest" style="font-size:0.8rem;">Gast-Session beenden</button>
      </div>
    `;
    this.container.insertAdjacentHTML("beforeend", html);

    // Event-Handler
    this.container
      .querySelector("#btn-register-from-guest")
      .addEventListener("click", () => {
        this.printRegisterForm();
      });

    // Gast-Session beenden über ApiClient
    this.container
      .querySelector("#btn-end-guest")
      .addEventListener("click", () => {
        this.apiClient
          .endGuestSession()
          .then(() => {
            this.sessionManager.reset();
            this.mode = "guest";
            this.init();
          })
          .catch(console.error);
      });
  };

  /**
   * Aktuelles Todo-Objekt zurücksetzen
   * Initialisiert leeres Todo für Neu-Erstellung
   */
  this.resetCurrentTodo = function () {
    this.currentTodo = {
      id: 0,
      title: "",
      description: "",
      completed: 0,
    };
  };

  /**
   * UI-Modus wechseln ohne komplette Neuinitialisierung
   * @param {string} mode - Neuer Modus ("list", "form", "guest")
   */
  this.changeMode = function (mode) {
    this.mode = mode;
    // Nur UI neu bauen, nicht komplette App neu starten
    this.buildUI();
  };

  /**
   * Authentifizierungs-Optionen rendern
   */
  this.printAuthOptions = function () {
    const html = `
    <div style="text-align:center; margin-top:2rem;">
      <button class="btn-todo btn-login" id="btn-login">Login</button>
      <button class="btn-todo btn-register" id="btn-register">Registrieren</button>
      <button class="btn-todo btn-guest" id="btn-guest">Als Gast starten</button>
    </div>
  `;
    this.container.insertAdjacentHTML("beforeend", html);

    // Event-Handler
    this.container.querySelector("#btn-login").addEventListener("click", () => {
      this.printLoginForm();
    });

    this.container
      .querySelector("#btn-register")
      .addEventListener("click", () => {
        this.printRegisterForm();
      });

    // Gast-Session starten über ApiClient
    this.container.querySelector("#btn-guest").addEventListener("click", () => {
      this.apiClient
        .startGuestSession()
        .then(() => {
          this.sessionManager.guestStarted = true;
          this.sessionManager.userLoggedIn = false;
          this.mode = "list";
          this.init();
        })
        .catch(console.error);
    });
  };

  /**
   * Login-Formular rendern (verwendet ApiClient)
   */
  this.printLoginForm = function () {
    const html = `
      <form id="login-form" style="margin:2rem auto; max-width:320px;">
        <input type="email" id="login-email" placeholder="Email" required class="form-input-generally form-input" style="margin-bottom:1rem;width:100%;">
        <input type="password" id="login-password" placeholder="Passwort" required class="form-input-generally form-input" style="margin-bottom:1rem;width:100%;">
        <button class="btn-todo" id="btn-login-submit" type="submit">Login</button>
        <button class="btn-todo" id="btn-login-cancel" type="button">Abbrechen</button>
      </form>
    `;
    this.container.innerHTML = html;

    this.container
      .querySelector("#login-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const email = this.container.querySelector("#login-email").value;
        const password = this.container.querySelector("#login-password").value;

        // Login über ApiClient
        this.apiClient
          .login(email, password)
          .then(() => {
            // Session-Status nach Login aktualisieren
            this.sessionManager.userLoggedIn = true;
            this.sessionManager.guestStarted = false;
            this.mode = "list";
            this.init();
          })
          .catch(() => alert("Login fehlgeschlagen"));
      });

    this.container
      .querySelector("#btn-login-cancel")
      .addEventListener("click", () => this.init());
  };

  /**
   * Registrierungs-Formular rendern (verwendet ApiClient)
   */
  this.printRegisterForm = function () {
    const html = `
      <form id="register-form" style="margin:2rem auto; max-width:320px;">
        <input type="email" id="register-email" placeholder="Email" required class="form-input-generally form-input" style="margin-bottom:1rem;width:100%;">
        <input type="password" id="register-password" placeholder="Passwort" required class="form-input-generally form-input" style="margin-bottom:1rem;width:100%;">
        <button class="btn-todo" id="btn-register-submit" type="submit">Registrieren</button>
        <button class="btn-todo" id="btn-register-cancel" type="button">Abbrechen</button>
      </form>
    `;
    this.container.innerHTML = html;

    this.container
      .querySelector("#register-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const email = this.container.querySelector("#register-email").value;
        const password =
          this.container.querySelector("#register-password").value;

        // Registrierung über ApiClient
        this.apiClient
          .register(email, password)
          .then(() => {
            alert("Registrierung erfolgreich! Jetzt einloggen.");
            this.printLoginForm();
          })
          .catch((err) => {
            // Error-Handling wird bereits über ApiClient.errorHandler gemacht
            console.error("Registrierung fehlgeschlagen:", err);
          });
      });

    this.container
      .querySelector("#btn-register-cancel")
      .addEventListener("click", () => this.init());
  };

  /**
   * Logout-Button rendern (verwendet ApiClient)
   */
  this.printLogout = function () {
    const html = `
      <div style="text-align:right;">
        <button class="btn-todo btn-logout" id="btn-logout">Logout</button>
      </div>
    `;
    this.container.insertAdjacentHTML("afterbegin", html);

    this.container
      .querySelector("#btn-logout")
      .addEventListener("click", () => {
        // Logout über ApiClient
        this.apiClient.logout().then(() => {
          this.sessionManager.reset();
          this.mode = "guest";
          this.init();
        });
      });
  };

  /**
   * Modus-abhängige Action-Buttons rendern
   * "Todo anlegen" in List-Modus, "Zurück" in Form-Modus
   */
  this.printBtn = function () {
    if (this.mode === "list") {
      const html = `<div><button class="btn-todo btn-todo-add" id="btn-todo-add">Todo anlegen</button></div>`;
      this.container.insertAdjacentHTML("beforeend", html);

      this.container
        .querySelector("#btn-todo-add")
        .addEventListener("click", (e) => {
          e.preventDefault();
          this.resetCurrentTodo();
          this.changeMode("form");
        });
    } else if (this.mode === "form") {
      const html = `<div><button class="btn-todo btn-todo-back" id="btn-todo-back">Zurück zur Todo-Liste</button></div>`;
      this.container.insertAdjacentHTML("beforeend", html);

      this.container
        .querySelector("#btn-todo-back")
        .addEventListener("click", (e) => {
          e.preventDefault();
          this.resetCurrentTodo();
          this.changeMode("list");
        });
    }
  };

  /**
   * Einzelnes Todo-Item rendern (verwendet ApiClient)
   */
  this.printTodo = function (todo) {
    const html = `
      <div class="todo-item-wrapper" id="todo-item-${todo.id}">
        <div class="todo-item">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="todo-${
              todo.id
            }-check" ${todo.completed == 1 ? "checked" : ""} />
            <label class="form-check-label ${
              todo.completed == 1 ? "todo-item-completed" : ""
            }"
                   id="todo-${todo.id}-check-label" for="todo-${todo.id}-check">
              ${todo.title}
            </label>
          </div>
          <div class="icon-wrapper">
            <img src="assets/img/edit_note.svg" class="note-icon note-edit" id="note-edit-${
              todo.id
            }" title="bearbeiten" />
            <img src="assets/img/delete_note.svg" class="note-icon note-delete" id="note-delete-${
              todo.id
            }" title="löschen" />
          </div>
        </div>
      </div>
    `;
    this.container.insertAdjacentHTML("beforeend", html);

    // Checkbox-Handler: Verwendet ApiClient
    this.container
      .querySelector(`#todo-${todo.id}-check`)
      .addEventListener("change", (e) => {
        e.preventDefault();
        const updateData = {
          completed: e.target.checked ? 1 : 0,
        };

        this.apiClient.updateTodo(todo.id, updateData).then(() => {
          this.container
            .querySelector(`#todo-${todo.id}-check-label`)
            .classList.toggle("todo-item-completed", e.target.checked);
        });
      });

    // Edit-Handler: Verwendet ApiClient
    this.container
      .querySelector(`#note-edit-${todo.id}`)
      .addEventListener("click", () => {
        this.apiClient.getTodo(todo.id).then((json) => {
          this.currentTodo = json;
          this.changeMode("form");
        });
      });

    // Delete-Handler: Verwendet ApiClient
    this.container
      .querySelector(`#note-delete-${todo.id}`)
      .addEventListener("click", () => {
        this.apiClient.deleteTodo(todo.id).then(() => {
          this.container.querySelector(`#todo-item-${todo.id}`).remove();
        });
      });
  };

  /**
   * Todo-Erstellungs-/Bearbeitungs-Formular rendern
   * Dynamisches Formular mit Validierung und Dual-Submit-Buttons
   */
  this.printForm = function () {
    const html = `
      <div class="todo-item-wrapper">
        <form class="todo-form" id="todo-form">
          <div class="form-group">
            <label for="todo-title">Titel*</label>
            <input class="form-input-generally form-input" id="todo-title" type="text" name="title" required placeholder="Was ist zu tun?" value="${
              this.currentTodo.title
            }" />
          </div>
          <div class="form-group">
            <label for="todo-description">Beschreibung</label>
            <textarea class="form-input-generally form-textarea" id="todo-description" name="description" rows="3" placeholder="Details (optional)">${
              this.currentTodo.description
            }</textarea>
          </div>
          <div class="form-group form-checkbox">
            <input class="form-checkbox-input" id="todo-completed" type="checkbox" name="completed" ${
              this.currentTodo.completed == 1 ? "checked" : ""
            } />
            <label for="todo-completed">Erledigt</label>
          </div>
          <div class="form-actions">
            <button class="btn-todo btn-todo-submit" id="btn-todo-submit" type="submit" disabled data-id="${
              this.currentTodo.id
            }">Speichern</button>
            ${
              this.currentTodo.id === 0
                ? `<button class="btn-todo btn-todo-submit" id="todo-submit-next" type="submit" disabled data-id="${this.currentTodo.id}">Speichern ++</button>`
                : ""
            }
          </div>
        </form>
      </div>
    `;
    this.container.insertAdjacentHTML("beforeend", html);

    // Submit-Handler registrieren
    this.container
      .querySelector("#btn-todo-submit")
      .addEventListener("click", (e) => this.saveTodoHandler(e));

    if (this.currentTodo.id === 0) {
      this.container
        .querySelector("#todo-submit-next")
        .addEventListener("click", (e) => this.saveTodoHandler(e, "next"));
    }

    // Live-Validierung aktivieren
    setupFormValidation(
      this.container.querySelector("#todo-title"),
      this.container.querySelector("#btn-todo-submit"),
      this.currentTodo.id === 0
        ? this.container.querySelector("#todo-submit-next")
        : null
    );
  };

  /**
   * Todo-Speichern-Handler (verwendet ApiClient)
   */
  this.saveTodoHandler = function (event, mode = "save") {
    event.preventDefault();
    const title = this.container.querySelector("#todo-title").value;
    const description = this.container.querySelector("#todo-description").value;
    const completed = this.container.querySelector("#todo-completed").checked;

    const todoData = {
      title,
      description,
      completed: completed ? 1 : 0,
    };

    const todoId = parseInt(event.target.dataset.id);

    if (todoId > 0) {
      // Update über ApiClient
      this.apiClient
        .updateTodo(todoId, todoData)
        .then(() => this.changeMode("list"));
    } else if (mode === "save") {
      // Create über ApiClient
      this.apiClient.createTodo(todoData).then(() => this.changeMode("list"));
    } else {
      // Create und neues Formular
      this.apiClient.createTodo(todoData).then(() => {
        this.resetCurrentTodo();
        this.changeMode("form");
      });
    }
  };

  /**
   * Fehleranzeige im UI
   */
  this.showError = function (msg) {
    let errorDiv = this.container.querySelector(".todo-error");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "todo-error";
      errorDiv.style.color = "red";
      errorDiv.style.margin = "1rem 0";
      this.container.insertAdjacentElement("afterbegin", errorDiv);
    }
    errorDiv.textContent = msg;
  };
}

/**
 * DOM-Ready Event-Handler
 * Initialisiert Todo-App nach vollständigem DOM-Loading
 */
document.addEventListener("DOMContentLoaded", () => {
  const todoAppInstance = new todoApp();
  todoAppInstance.init();
});

/**
 * Live-Formularvalidierung für Titel-Input
 * Aktiviert/Deaktiviert Submit-Buttons basierend auf Titel-Eingabe
 * @param {HTMLInputElement} titleInput - Titel-Eingabefeld
 * @param {HTMLButtonElement} submitBtn - Haupt-Submit-Button
 * @param {HTMLButtonElement|null} [submitNextBtn=null] - Optionaler "Speichern ++" Button
 */
function setupFormValidation(titleInput, submitBtn, submitNextBtn = null) {
  function toggle() {
    const empty = titleInput.value.trim() === "";
    submitBtn.disabled = empty;
    if (submitNextBtn) submitNextBtn.disabled = empty;
  }
  titleInput.addEventListener("input", toggle);
  toggle(); // Initial-Validierung
}
