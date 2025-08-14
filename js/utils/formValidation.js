/**
 * Form-Validierungs-Utilities
 * Wiederverwendbare Funktionen für Frontend-Formularvalidierung
 */

"use strict";

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

/**
 * E-Mail-Validierung
 * @param {string} email - E-Mail-Adresse
 * @returns {boolean} - Gültig oder nicht
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Passwort-Stärke-Validierung
 * @param {string} password - Passwort
 * @returns {Object} - { valid: boolean, message: string }
 */
function validatePassword(password) {
  if (password.length < 6) {
    return { valid: false, message: "Passwort muss mindestens 6 Zeichen haben" };
  }
  if (password.length > 128) {
    return { valid: false, message: "Passwort ist zu lang (max. 128 Zeichen)" };
  }
  return { valid: true, message: "Passwort ist gültig" };
}

/**
 * Allgemeine Eingabefeld-Validierung
 * @param {HTMLInputElement} input - Eingabefeld
 * @param {Function} validator - Validierungsfunktion
 * @param {HTMLElement} errorElement - Element für Fehlermeldung
 */
function setupInputValidation(input, validator, errorElement) {
  input.addEventListener("blur", () => {
    const result = validator(input.value);
    if (!result.valid) {
      errorElement.textContent = result.message;
      errorElement.style.display = "block";
      input.classList.add("error");
    } else {
      errorElement.style.display = "none";
      input.classList.remove("error");
    }
  });
}

// Globale Verfügbarkeit für app.js
window.setupFormValidation = setupFormValidation;
window.validateEmail = validateEmail;
window.validatePassword = validatePassword;
window.setupInputValidation = setupInputValidation;
