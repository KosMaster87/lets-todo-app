// todoApp.js
"use strict";

// const API_BASE = "/api/";
const API_BASE = "https://api-restful-guest-access.dev2k.org/api/";

function todoApp() {
  this.container = "";
  this.mode = "guest";
  this.guestStarted = false;
  this.currentTodo = {};

  this.init = function () {
    this.container = document.querySelector("#content");
    this.container.innerHTML = "";

    // 1) Cookie auslesen
    const guestCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("guestId="));

    // 2) Wenn Cookie da ist, Gast‑Modus aktivieren
    if (guestCookie) {
      this.guestStarted = true;
      this.mode = this.mode === "guest" ? "list" : this.mode;
    }

    // 3) Gast‑ID anzeigen (falls gesetzt)
    this.showGuestCookie();

    // 4) UI bauen
    if (!this.guestStarted) {
      this.printGuestStart();
    } else if (this.mode === "list") {
      this.printBtn();
      this.getAllTodos();
    } else if (this.mode === "form") {
      this.printBtn();
      this.printForm();
    }
  };

  this.showGuestCookie = function () {
    const guestCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("guestId="));
    if (guestCookie) {
      const guestId = guestCookie.split("=")[1];
      this.container.insertAdjacentHTML(
        "beforeend",
        `<p style="font-size:0.8rem; color:#666">Gast‑Session: ${guestId}</p>`
      );
    }
  };

  this.printGuestStart = function () {
    const html = `
    <div style="text-align:center; margin-top:2rem;">
      <button class="btn-todo btn-guest" id="btn-guest">Als Gast starten</button>
    </div>
  `;
    this.container.insertAdjacentHTML("beforeend", html);
    const btn = this.container.querySelector("#btn-guest");
    btn.addEventListener("click", () => {
      // 1) Einmalig Cookie auf Server anfordern
      this.apiHandler(API_BASE, "GET")
        .then(() => {
          // 2) Nun ist cookie gesetzt → Frontend neu initialisieren
          this.guestStarted = true;
          this.mode = "list";
          this.init();
        })
        .catch(console.error);
    });
  };

  this.resetCurrentTodo = function () {
    this.currentTodo = {
      id: 0,
      title: "",
      description: "",
      completed: 0,
    };
  };

  this.changeMode = function (mode) {
    this.mode = mode;
    this.container.innerHTML = "";
    this.init();
  };

  // ============================================================
  // ============================================================

  this.printBtn = function (todo) {
    /**
     * ADD TODO BTN
     */
    if (this.mode === "list") {
      let html = `
        <div class="">
          <button class="btn-todo btn-todo-add" id="btn-todo-add">Todo anlegen</button>
        </div>
      `;

      this.container.insertAdjacentHTML("beforeend", html);

      let element = this.container.querySelector("#btn-todo-add");
      element.addEventListener("click", (event) => {
        event.preventDefault();
        this.resetCurrentTodo();
        this.changeMode("form");
      });
    }

    /**
     * BACK TO LIST BTN
     */
    if (this.mode === "form") {
      let html = `
        <div class="">
          <button class="btn-todo btn-todo-back" id="btn-todo-back">Zurück zur Todo-Liste</button>
        </div>
      `;

      this.container.insertAdjacentHTML("beforeend", html);

      let element = this.container.querySelector("#btn-todo-back");
      element.addEventListener("click", (event) => {
        event.preventDefault();
        this.resetCurrentTodo();
        this.changeMode("list");
      });
    }
  };

  // ============================================================
  // ============================================================

  this.printTodo = function (todo) {
    let html = `
      <div class="todo-item-wrapper" id="todo-item-${todo.id}">
        <div class="todo-item">

          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="todo-${
              todo.id
            }-check" ${todo.completed == 1 ? "checked" : ""}/>

            <label class="form-check-label ${
              todo.completed == 1 ? "todo-item-completed" : ""
            }" id="todo-${todo.id}-check-label" for="todo-${todo.id}-check">${
      todo.title
    }</label>
          </div>

          <div class="icon-wrapper">
            <img src="assets/img/edit_note.svg" class="note-icon note-edit" id="note-edit-${
              todo.id
            }" title="bearbeiten"></img>
            <img src="assets/img/delete_note.svg" class="note-icon note-delete" id="note-delete-${
              todo.id
            }" title="löschen"></img>
          </div>
        </div>
      </div>
      `;

    this.container.insertAdjacentHTML("beforeend", html);

    /**
     * Checkbox update
     */
    let checkbox = this.container.querySelector(`#todo-${todo.id}-check`);
    checkbox.addEventListener("change", (event) => {
      event.preventDefault();

      let targetData = {
        id: todo.id,
        completed: event.target.checked ? 1 : 0,
      };

      this.updateTodo(targetData).then(() => {
        let label = this.container.querySelector(
          `#todo-${todo.id}-check-label`
        );
        label.classList.toggle("todo-item-completed", event.target.checked);
      });
    });

    /**
     * Edit Todo
     */
    let editBtn = this.container.querySelector(`#note-edit-${todo.id}`);
    editBtn.addEventListener("click", () => {
      this.getTodo(todo).then((json) => {
        this.currentTodo = json;
        this.changeMode("form");
      });
    });

    /**
     * Delete Todo
     */
    let deleteBtn = this.container.querySelector(`#note-delete-${todo.id}`);
    deleteBtn.addEventListener("click", () => {
      this.deleteTodo(todo).then(() => {
        let todoItem = this.container.querySelector(`#todo-item-${todo.id}`);
        todoItem.remove();
      });
    });
  };

  // ============================================================

  this.printForm = function () {
    let html = `
        <div class="todo-item-wrapper">
          <form class="todo-form" id="todo-form">

            <div class="form-group">
              <label for="todo-title">Titel*</label>
              <input 
                class="form-input-generally form-input"
                id="todo-title" 
                type="text" 
                name="title" 
                required 
                placeholder="Was ist zu tun?"
                value="${this.currentTodo.title}"
              >
            </div>
            
            <div class="form-group">
              <label for="todo-description">Beschreibung</label>
              <textarea 
                class="form-input-generally form-textarea"
                id="todo-description" 
                name="description" 
                rows="3" 
                placeholder="Details (optional)"
              >${this.currentTodo.description}</textarea>
            </div>
            
            <div class="form-group form-checkbox">
              <input 
                class="form-checkbox-input"
                id="todo-completed" 
                type="checkbox" 
                name="completed"
                ${this.currentTodo.completed == 1 ? "checked" : ""}
              >
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

    /**
     * SAVE note
     */
    let form = this.container.querySelector("#btn-todo-submit");
    form.addEventListener("click", (event) => {
      this.saveTodoHandler(event);
    });

    /**
     * SAVE note and NEXT
     */
    if (this.currentTodo.id === 0) {
      let elementNext = this.container.querySelector("#todo-submit-next");
      elementNext.addEventListener("click", (event) => {
        this.saveTodoHandler(event, "next");
      });
    }

    let titleInput = this.container.querySelector("#todo-title");
    let submitBtn = this.container.querySelector("#btn-todo-submit");
    let submitNextBtn = this.container.querySelector("#todo-submit-next");

    setupFormValidation(titleInput, submitBtn, submitNextBtn);
  };

  this.saveTodoHandler = function (event, mode = "save") {
    event.preventDefault();

    let title = this.container.querySelector("#todo-title").value;
    let description = this.container.querySelector("#todo-description").value;
    let completed = this.container.querySelector("#todo-completed").checked;

    let todo = {
      id: parseInt(event.target.dataset.id),
      title: title,
      description,
      completed: completed ? 1 : 0,
    };

    if (todo.id > 0) {
      this.updateTodo(todo).then(() => {
        this.changeMode("list");
      });
    }

    if (todo.id === 0 && mode === "save") {
      this.createTodo(todo).then(() => {
        this.changeMode("list");
      });
    }

    if (todo.id === 0 && mode === "next") {
      this.createTodo(todo).then(() => {
        this.resetCurrentTodo();
        this.changeMode("form");
      });
    }
  };

  // ============================================================
  // ============================================================

  this.getAllTodos = function () {
    this.apiHandler(`${API_BASE}/todos`, "GET").then((json) => {
      for (let i = 0; i < json.length; i++) {
        this.printTodo(json[i]);
      }
    });
  };

  this.getTodo = function (data) {
    return this.apiHandler(`${API_BASE}/todos/${data.id}`, "GET").then(
      (json) => {
        return json;
      }
    );
  };

  this.createTodo = function (data) {
    return this.apiHandler(`${API_BASE}/todos`, "POST", data).then((json) => {
      return json;
    });
  };

  this.updateTodo = function (data) {
    return this.apiHandler(`${API_BASE}/todos/${data.id}`, "PATCH", data).then(
      (json) => {
        return json;
      }
    );
  };

  this.deleteTodo = function (data) {
    return this.apiHandler(`${API_BASE}/todos/${data.id}`, "DELETE", data).then(
      (json) => {
        return json;
      }
    );
  };

  // ============================================================
  // ================ API handler ===============================

  /**
   * API handler mit Cookie-Support
   */
  this.apiHandler = function (url, method, data = null) {
    // doppelte Slashes verhindern
    url = url.replace(/([^:]\/)\/+/g, "$1");

    const options = {
      method: method,
      cache: "no-cache",
      credentials: "include", // send cookies
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data !== null) {
      options.body = JSON.stringify(data);
    }

    return fetch(url, options)
      .then((response) => {
        if (!response.ok) throw new Error("Netzwerkantwort war nicht ok");
        return response.json();
      })
      .catch((error) => {
        console.error("Fehler bei API-Anfrage:", error);
        throw error;
      });
  };
}

// ==================== DOM ready =============================

document.addEventListener("DOMContentLoaded", function () {
  const todoAppInstance = new todoApp();
  todoAppInstance.init();
});

// ============================================================

/**
 * Form Validation for title input
 * @param {*} titleInput
 * @param {*} submitBtn
 * @param {*} submitNextBtn
 */
function setupFormValidation(titleInput, submitBtn, submitNextBtn = null) {
  function toggleSubmitButtons() {
    const isEmpty = titleInput.value.trim() === "";
    submitBtn.disabled = isEmpty;
    if (submitNextBtn) {
      submitNextBtn.disabled = isEmpty;
    }
  }

  toggleSubmitButtons();
  titleInput.addEventListener("input", toggleSubmitButtons);
}
