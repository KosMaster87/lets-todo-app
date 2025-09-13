/**
 * Environment-spezifische Konfiguration
 * Automatische Erkennung basierend auf Hostname
 */

"use strict";

/**
 * Konfiguration für verschiedene Environments
 */
const CONFIG = {
  development: {
    API_BASE: "http://127.0.0.1:3000/api",
    DEBUG: true,
    COOKIE_DOMAIN: "127.0.0.1",
    SESSION_TIMEOUT: 1000 * 60 * 60, // 1 Stunde für Development
    LOG_LEVEL: "verbose",
  },
  feature: {
    API_BASE: "https://lets-todo-api-feat.dev2k.org/api",
    DEBUG: true,
    COOKIE_DOMAIN: ".dev2k.org",
    SESSION_TIMEOUT: 1000 * 60 * 60, // 1 Stunde für Feature Testing
    LOG_LEVEL: "debug",
  },
  staging: {
    API_BASE: "https://lets-todo-api-stage.dev2k.org/api",
    DEBUG: true,
    COOKIE_DOMAIN: ".dev2k.org",
    SESSION_TIMEOUT: 1000 * 60 * 30, // 30 Minuten für Staging
    LOG_LEVEL: "info",
  },
  production: {
    API_BASE: "https://lets-todo-api.dev2k.org/api",
    DEBUG: false,
    COOKIE_DOMAIN: ".dev2k.org",
    SESSION_TIMEOUT: 1000 * 60 * 60 * 24, // 24 Stunden für Production
    LOG_LEVEL: "error",
  },
};

/**
 * Auto-Detection des aktuellen Environments
 * Basierend auf Hostname und Port
 */
function detectEnvironment() {
  const hostname = window.location.hostname;
  const port = window.location.port;

  // Development: localhost oder 127.0.0.1
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "development";
  }

  // Feature: feat subdomain
  if (hostname.includes("feat")) {
    return "feature";
  }

  // Staging: stage subdomain
  if (hostname.includes("stage")) {
    return "staging";
  }

  // Production: alle anderen Domains
  return "production";
}

/**
 * Aktuelles Environment
 * @type {string}
 */
const ENVIRONMENT = detectEnvironment();

/**
 * Aktuelle Environment-Konfiguration
 * @type {Object}
 */
const ENV = CONFIG[ENVIRONMENT];

/**
 * Debug-Logger der nur in Development/Staging aktiv ist
 * @param {string} message - Log-Nachricht
 * @param {*} data - Zusätzliche Daten
 */
function debugLog(message, data = null) {
  if (ENV.DEBUG) {
    console.log(`🔧 [${ENVIRONMENT.toUpperCase()}] ${message}`, data || "");
  }
}

/**
 * Info-Logger für wichtige Informationen
 * @param {string} message - Log-Nachricht
 * @param {*} data - Zusätzliche Daten
 */
function infoLog(message, data = null) {
  if (ENV.LOG_LEVEL === "verbose" || ENV.LOG_LEVEL === "info") {
    console.log(`ℹ️ [${ENVIRONMENT.toUpperCase()}] ${message}`, data || "");
  }
}

/**
 * Error-Logger für alle Environments
 * @param {string} message - Error-Nachricht
 * @param {*} error - Error-Objekt
 */
function errorLog(message, error = null) {
  console.error(`❌ [${ENVIRONMENT.toUpperCase()}] ${message}`, error || "");
}

// Initial-Log beim Laden
debugLog(`Environment Detection: ${ENVIRONMENT}`, {
  hostname: window.location.hostname,
  port: window.location.port,
  apiBase: ENV.API_BASE,
  debug: ENV.DEBUG,
});

// Global verfügbar machen
window.ENV = ENV;
window.ENVIRONMENT = ENVIRONMENT;
window.debugLog = debugLog;
window.infoLog = infoLog;
window.errorLog = errorLog;
