/**
 * Session-Management Modul
 * Verwaltet Cookies, Session-Validierung und Auth-Status
 */

"use strict";

/**
 * Session-Manager Klasse
 * @constructor
 */
function SessionManager() {
  /** @type {boolean} Flag: User eingeloggt */
  this.userLoggedIn = false;

  /** @type {boolean} Flag: Gast-Session aktiv */
  this.guestStarted = false;

  /**
   * Cookie-Reader mit Debug-Funktionalität
   * @param {string} name - Name des gesuchten Cookies
   * @returns {string|null} Cookie-Wert oder null
   */
  this.getCookie = function (name) {
    debugLog(`Suche nach Cookie: ${name}`);

    const allCookies = document.cookie.split(";").map((c) => c.trim());
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      const cookieValue = parts.pop().split(";").shift();
      debugLog(`Cookie ${name} gefunden:`, cookieValue);
      return cookieValue;
    }

    // Alternative Suche
    const altSearch = allCookies.find((cookie) =>
      cookie.startsWith(`${name}=`)
    );

    if (altSearch) {
      const altValue = altSearch.split("=")[1];
      debugLog(`Cookie ${name} alternativ gefunden:`, altValue);
      return altValue;
    }

    debugLog(`Cookie ${name} nicht gefunden`);
    return null;
  };

  /**
   * Session-Status basierend auf Backend-Response setzen
   * @param {Object} response - Backend-Response
   */
  this.setSessionStatus = function (response) {
    if (response.valid) {
      if (response.type === "user") {
        this.userLoggedIn = true;
        this.guestStarted = false;
      } else if (response.type === "guest") {
        this.userLoggedIn = false;
        this.guestStarted = true;
      }
    } else {
      this.userLoggedIn = false;
      this.guestStarted = false;
    }
  };

  /**
   * Session beim Backend validieren
   * @param {Function} apiHandler - API-Handler Funktion
   * @returns {Promise<Object>}
   */
  this.validateSession = function (apiHandler) {
    return apiHandler(`${ENV.API_BASE}/session/validate`, "GET").then(
      (response) => {
        debugLog("Session-Validierung:", response);
        this.setSessionStatus(response);
        return response;
      }
    );
  };

  /**
   * Alle Session-Cookies löschen
   */
  this.clearAllCookies = function () {
    // In Development keine Domain, in Production mit Domain
    if (ENV.COOKIE_DOMAIN) {
      document.cookie = `guestId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${ENV.COOKIE_DOMAIN}`;
      document.cookie = `userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${ENV.COOKIE_DOMAIN}`;
    } else {
      document.cookie = `guestId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  };

  /**
   * Session-Info HTML generieren
   * @returns {string} HTML für Session-Info
   */
  this.getSessionInfoHTML = function () {
    const guestCookie = this.getCookie("guestId");
    const userCookie = this.getCookie("userId");

    if (guestCookie && this.guestStarted) {
      return `<p style="font-size:0.8rem; color:#666">Gast-Session: ${guestCookie}</p>`;
    } else if (userCookie && this.userLoggedIn) {
      return `<p style="font-size:0.8rem; color:#666">Benutzer-Session: User ${userCookie}</p>`;
    }
    return "";
  };

  /**
   * Prüfen ob User eingeloggt ist
   * @returns {boolean}
   */
  this.isUserLoggedIn = function () {
    return this.userLoggedIn;
  };

  /**
   * Prüfen ob Gast-Session aktiv ist
   * @returns {boolean}
   */
  this.isGuestStarted = function () {
    return this.guestStarted;
  };

  /**
   * Session-Status zurücksetzen
   */
  this.reset = function () {
    this.userLoggedIn = false;
    this.guestStarted = false;
  };
}
