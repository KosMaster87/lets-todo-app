/**
 * API-Client Modul
 * Zentrale HTTP-Kommunikation mit Fehlerbehandlung
 */

"use strict";

/**
 * API-Client für RESTful Communication
 * Verwendet Environment-Konfiguration für API-Base-URL
 * @constructor
 */
function ApiClient() {
  /** @type {string} API-Base-URL aus Environment-Konfiguration */
  this.apiBase = ENV.API_BASE;

  /** @type {Function} Error-Handler Callback */
  this.errorHandler = null;

  /**
   * Error-Handler registrieren
   * @param {Function} handler - Callback für Error-Handling
   */
  this.setErrorHandler = function (handler) {
    this.errorHandler = handler;
  };

  /**
   * Zentraler API-Handler
   * @param {string} url - API-Endpoint URL
   * @param {string} method - HTTP-Methode
   * @param {Object|null} data - Request-Body-Daten
   * @returns {Promise<Object>}
   */
  this.request = function (url, method, data = null) {
    url = url.replace(/([^:]\/)\/+/g, "$1"); // Doppelte Slashes bereinigen

    const options = {
      method,
      cache: "no-cache",
      credentials: "include", // Cookies für Session-Management
      headers: { "Content-Type": "application/json" },
    };

    if (data !== null) options.body = JSON.stringify(data);

    // Environment-basiertes Logging
    if (ENV.DEBUG) {
      debugLog(`API ${method} ${url}`, data || "(keine Daten)");
    }

    return fetch(url, options)
      .then((res) => {
        if (!res.ok) {
          return res
            .json()
            .then((json) => {
              const error = new Error("Netzwerkantwort war nicht ok");
              error.status = res.status;
              error.apiMessage =
                json && json.error ? json.error : json.message || "";
              throw error;
            })
            .catch(() => {
              const error = new Error("Netzwerkantwort war nicht ok");
              error.status = res.status;
              error.apiMessage = `HTTP ${res.status} ${res.statusText}`;
              throw error;
            });
        }
        return res.json();
      })
      .catch((err) => {
        console.error("Fehler bei API-Anfrage:", err, "URL:", url);

        // Session-Validierung: stummes Fehlerhandling
        if (url.includes("/session/validate")) {
          throw err;
        }

        // User-freundliche Fehleranzeige über Callback
        if (this.errorHandler) {
          if (err.status === 409) {
            this.errorHandler("Diese E-Mail ist bereits registriert.");
          } else if (err.status === 401) {
            this.errorHandler("Session ungültig. Bitte neu anmelden.");
          } else if (err.apiMessage) {
            this.errorHandler(err.apiMessage);
          } else {
            this.errorHandler(
              "Fehler bei der Serveranfrage. Bitte später erneut versuchen."
            );
          }
        }
        throw err;
      });
  };

  // ============================================================
  // Todo-spezifische API-Methoden
  // ============================================================

  /**
   * Alle Todos laden
   * @returns {Promise<Array>}
   */
  this.getAllTodos = function () {
    return this.request(`${this.apiBase}/todos`, "GET");
  };

  /**
   * Einzelnes Todo laden
   * @param {number} id - Todo-ID
   * @returns {Promise<Object>}
   */
  this.getTodo = function (id) {
    return this.request(`${this.apiBase}/todos/${id}`, "GET");
  };

  /**
   * Todo erstellen
   * @param {Object} todoData - Todo-Daten
   * @returns {Promise<Object>}
   */
  this.createTodo = function (todoData) {
    return this.request(`${this.apiBase}/todos`, "POST", todoData);
  };

  /**
   * Todo aktualisieren
   * @param {number} id - Todo-ID
   * @param {Object} todoData - Update-Daten
   * @returns {Promise<Object>}
   */
  this.updateTodo = function (id, todoData) {
    return this.request(`${this.apiBase}/todos/${id}`, "PATCH", todoData);
  };

  /**
   * Todo löschen
   * @param {number} id - Todo-ID
   * @returns {Promise<Object>}
   */
  this.deleteTodo = function (id) {
    return this.request(`${this.apiBase}/todos/${id}`, "DELETE");
  };

  // ============================================================
  // Auth-spezifische API-Methoden
  // ============================================================

  /**
   * User registrieren
   * @param {string} email - E-Mail
   * @param {string} password - Passwort
   * @returns {Promise<Object>}
   */
  this.register = function (email, password) {
    return this.request(`${this.apiBase}/register`, "POST", {
      email,
      password,
    });
  };

  /**
   * User einloggen
   * @param {string} email - E-Mail
   * @param {string} password - Passwort
   * @returns {Promise<Object>}
   */
  this.login = function (email, password) {
    return this.request(`${this.apiBase}/login`, "POST", { email, password });
  };

  /**
   * User ausloggen
   * @returns {Promise<Object>}
   */
  this.logout = function () {
    return this.request(`${this.apiBase}/logout`, "POST");
  };

  /**
   * Gast-Session starten
   * @returns {Promise<Object>}
   */
  this.startGuestSession = function () {
    return this.request(`${this.apiBase}/session/guest`, "POST");
  };

  /**
   * Gast-Session beenden
   * @returns {Promise<Object>}
   */
  this.endGuestSession = function () {
    return this.request(`${this.apiBase}/session/guest/end`, "POST");
  };
}
