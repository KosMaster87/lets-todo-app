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
  /** @type {HTMLElement|null} Container-Element für das UI */
  this.container = null;

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
      UIRenderer.renderModeButtons(this.container, this.mode, this);
      this.loadAndDisplayTodos();
    } else if (this.mode === "form") {
      UIRenderer.renderModeButtons(this.container, this.mode, this);
      UIRenderer.renderTodoForm(this.container, this.currentTodo, this);
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
    UIRenderer.renderGuestInfo(this.container, this);
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
    UIRenderer.renderAuthOptions(this.container, this);
  };

  /**
   * Login-Formular rendern (verwendet UIRenderer)
   */
  this.printLoginForm = function () {
    UIRenderer.renderLoginForm(this.container, this);
  };

  /**
   * Registrierungs-Formular rendern (verwendet UIRenderer)
   */
  this.printRegisterForm = function () {
    UIRenderer.renderRegisterForm(this.container, this);
  };

  /**
   * Logout-Button rendern (verwendet UIRenderer)
   */
  this.printLogout = function () {
    UIRenderer.renderLogoutButton(this.container, this);
  };

  /**
   * Einzelnes Todo-Item rendern (verwendet UIRenderer)
   */
  this.printTodo = function (todo) {
    UIRenderer.renderTodoItem(this.container, todo, this);
  };

  /**
   * Todo-Speichern-Handler (verwendet ApiClient)
   */
  this.saveTodoHandler = function (event, mode = "save") {
    event.preventDefault();
    const title = this.container.querySelector("#todo-title").value;
    const description = this.container.querySelector("#todo-description").value;
    const completed = this.container.querySelector("#todo-completed").checked;

    const todoData = { title, description, completed: completed ? 1 : 0 };
    const todoId = parseInt(event.target.dataset.id);

    if (todoId > 0) {
      this.apiClient
        .updateTodo(todoId, todoData)
        .then(() => this.changeMode("list"));
    } else if (mode === "save") {
      this.apiClient.createTodo(todoData).then(() => this.changeMode("list"));
    } else {
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
 */
document.addEventListener("DOMContentLoaded", () => {
  const todoAppInstance = new todoApp();
  todoAppInstance.init();
});
