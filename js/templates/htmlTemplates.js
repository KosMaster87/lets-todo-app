/**
 * HTML-Templates Modul
 * Zentrale Sammlung aller HTML-Templates für UI-Komponenten
 */

"use strict";

const HTMLTemplates = {
  /**
   * Authentifizierungs-Optionen Template
   * @returns {string} HTML für Login/Register/Gast Buttons
   */
  authOptions: function () {
    return `
      <div style="text-align:center; margin-top:2rem;">
        <button class="btn-todo btn-login" id="btn-login">Login</button>
        <button class="btn-todo btn-register" id="btn-register">Registrieren</button>
        <button class="btn-todo btn-guest" id="btn-guest">Als Gast starten</button>
      </div>
    `;
  },

  /**
   * Login-Formular Template
   * @returns {string} HTML für Login-Formular
   */
  loginForm: function () {
    return `
      <form id="login-form" style="margin:2rem auto; max-width:320px;">
        <input type="email" id="login-email" placeholder="Email" required class="form-input-generally form-input" style="margin-bottom:1rem;width:100%;">
        <input type="password" id="login-password" placeholder="Passwort" required class="form-input-generally form-input" style="margin-bottom:1rem;width:100%;">
        <button class="btn-todo" id="btn-login-submit" type="submit">Login</button>
        <button class="btn-todo" id="btn-login-cancel" type="button">Abbrechen</button>
      </form>
    `;
  },

  /**
   * Registrierungs-Formular Template
   * @returns {string} HTML für Registrierungs-Formular
   */
  registerForm: function () {
    return `
      <form id="register-form" style="margin:2rem auto; max-width:320px;">
        <input type="email" id="register-email" placeholder="Email" required class="form-input-generally form-input" style="margin-bottom:1rem;width:100%;">
        <input type="password" id="register-password" placeholder="Passwort" required class="form-input-generally form-input" style="margin-bottom:1rem;width:100%;">
        <button class="btn-todo" id="btn-register-submit" type="submit">Registrieren</button>
        <button class="btn-todo" id="btn-register-cancel" type="button">Abbrechen</button>
      </form>
    `;
  },

  /**
   * Logout-Button Template
   * @returns {string} HTML für Logout-Button
   */
  logoutButton: function () {
    return `
      <div style="text-align:right;">
        <button class="btn-todo btn-logout" id="btn-logout">Logout</button>
      </div>
    `;
  },

  /**
   * Gast-Info Buttons Template
   * @returns {string} HTML für Gast-spezifische Buttons
   */
  guestInfo: function () {
    return `
      <div style="text-align:right; margin-bottom:1rem;">
        <button class="btn-todo btn-register-from-guest" id="btn-register-from-guest" style="font-size:0.8rem;">Account erstellen</button>
        <button class="btn-todo btn-end-guest" id="btn-end-guest" style="font-size:0.8rem;">Gast-Session beenden</button>
      </div>
    `;
  },

  /**
   * Todo-Hinzufügen Button Template
   * @returns {string} HTML für Todo-hinzufügen Button
   */
  addTodoButton: function () {
    return `<div><button class="btn-todo btn-todo-add" id="btn-todo-add">Todo anlegen</button></div>`;
  },

  /**
   * Zurück-Button Template
   * @returns {string} HTML für Zurück-Button
   */
  backButton: function () {
    return `<div><button class="btn-todo btn-todo-back" id="btn-todo-back">Zurück zur Todo-Liste</button></div>`;
  },

  /**
   * Todo-Item Template
   * @param {Object} todo - Todo-Objekt
   * @returns {string} HTML für einzelnes Todo-Item
   */
  todoItem: function (todo) {
    return `
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
  },

  /**
   * Todo-Formular Template
   * @param {Object} currentTodo - Aktuelles Todo-Objekt
   * @returns {string} HTML für Todo-Bearbeitungsformular
   */
  todoForm: function (currentTodo) {
    return `
      <div class="todo-item-wrapper">
        <form class="todo-form" id="todo-form">
          <div class="form-group">
            <label for="todo-title">Titel*</label>
            <input class="form-input-generally form-input" id="todo-title" type="text" name="title" required placeholder="Was ist zu tun?" value="${
              currentTodo.title
            }" />
          </div>
          <div class="form-group">
            <label for="todo-description">Beschreibung</label>
            <textarea class="form-input-generally form-textarea" id="todo-description" name="description" rows="3" placeholder="Details (optional)">${
              currentTodo.description
            }</textarea>
          </div>
          <div class="form-group form-checkbox">
            <input class="form-checkbox-input" id="todo-completed" type="checkbox" name="completed" ${
              currentTodo.completed == 1 ? "checked" : ""
            } />
            <label for="todo-completed">Erledigt</label>
          </div>
          <div class="form-actions">
            <button class="btn-todo btn-todo-submit" id="btn-todo-submit" type="submit" disabled data-id="${
              currentTodo.id
            }">Speichern</button>
            ${
              currentTodo.id === 0
                ? `<button class="btn-todo btn-todo-submit" id="todo-submit-next" type="submit" disabled data-id="${currentTodo.id}">Speichern ++</button>`
                : ""
            }
          </div>
        </form>
      </div>
    `;
  },
};

// Global verfügbar machen
window.HTMLTemplates = HTMLTemplates;
