// // todoApp.js
// "use strict";

// // const API_BASE = "/api/";
// const API_BASE = "https://api-restful-notes-user-session.dev2k.org/api/";

// function todoApp() {
//   this.container = "";
//   this.mode = "guest";
//   this.guestStarted = false;
//   this.currentTodo = {};
//   this.userLoggedIn = false;

//   this.init = function () {
//     this.container = document.querySelector("#content");
//     this.container.innerHTML = "";

//     // 1) Cookies prüfen
//     const guestCookie = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("guestId="));
//     const userCookie = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("userId="));

//     // 2) Status setzen
//     this.userLoggedIn = !!userCookie;
//     this.guestStarted = !!guestCookie;

//     // 3) Gast-ID anzeigen (falls gesetzt)
//     this.showGuestCookie();

//     // 4) UI bauen
//     if (!this.userLoggedIn && !this.guestStarted) {
//       // Kein Cookie: Menü mit allen drei Optionen
//       this.printAuthOptions();
//     } else if (this.userLoggedIn) {
//       this.mode = "list";
//       this.printLogout();
//       this.printBtn();
//       this.getAllTodos();
//     } else if (this.guestStarted) {
//       this.mode = this.mode === "guest" ? "list" : this.mode;
//       if (this.mode === "list") {
//         this.printBtn();
//         this.getAllTodos();
//       } else if (this.mode === "form") {
//         this.printBtn();
//         this.printForm();
//       }
//     }
//   };

//   this.showGuestCookie = function () {
//     const guestCookie = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("guestId="));
//     if (guestCookie) {
//       const guestId = guestCookie.split("=")[1];
//       this.container.insertAdjacentHTML(
//         "beforeend",
//         `<p style="font-size:0.8rem; color:#666">Gast‑Session: ${guestId}</p>`
//       );
//     }
//   };

//   this.printGuestStart = function () {
//     const html = `
//     <div style="text-align:center; margin-top:2rem;">
//       <button class="btn-todo btn-guest" id="btn-guest">Als Gast starten</button>
//     </div>
//   `;
//     this.container.insertAdjacentHTML("beforeend", html);
//     const btn = this.container.querySelector("#btn-guest");
//     btn.addEventListener("click", () => {
//       // 1) Einmalig Cookie auf Server anfordern
//       this.apiHandler(API_BASE, "GET")
//         .then(() => {
//           // 2) Nun ist cookie gesetzt → Frontend neu initialisieren
//           this.guestStarted = true;
//           this.mode = "list";
//           this.init();
//         })
//         .catch(console.error);
//     });
//   };

//   this.resetCurrentTodo = function () {
//     this.currentTodo = {
//       id: 0,
//       title: "",
//       description: "",
//       completed: 0,
//     };
//   };

//   this.changeMode = function (mode) {
//     this.mode = mode;
//     this.container.innerHTML = "";
//     this.init();
//   };

//   this.printAuthOptions = function () {
//     const html = `
//       <div style="text-align:center; margin-top:2rem;">
//         <button class="btn-todo btn-login" id="btn-login">Login</button>
//         <button class="btn-todo btn-register" id="btn-register">Registrieren</button>
//         <button class="btn-todo btn-guest" id="btn-guest">Als Gast starten</button>
//       </div>
//     `;
//     this.container.insertAdjacentHTML("beforeend", html);

//     this.container.querySelector("#btn-login").addEventListener("click", () => {
//       this.printLoginForm();
//     });
//     this.container
//       .querySelector("#btn-register")
//       .addEventListener("click", () => {
//         this.printRegisterForm();
//       });
//     this.container.querySelector("#btn-guest").addEventListener("click", () => {
//       this.apiHandler(API_BASE, "GET")
//         .then(() => {
//           this.guestStarted = true;
//           this.mode = "list";
//           this.init();
//         })
//         .catch(console.error);
//     });
//   };

//   this.printLoginForm = function () {
//     const html = `
//       <form id="login-form" style="margin:2rem auto; max-width:320px;">
//         <input type="email" id="login-email" placeholder="Email" required class="form-input-generally form-input" style="margin-bottom:1rem;width:100%;">
//         <input type="password" id="login-password" placeholder="Passwort" required class="form-input-generally form-input" style="margin-bottom:1rem;width:100%;">
//         <button class="btn-todo" id="btn-login-submit" type="submit">Login</button>
//         <button class="btn-todo" id="btn-login-cancel" type="button">Abbrechen</button>
//       </form>
//     `;
//     this.container.innerHTML = html;
//     this.container
//       .querySelector("#login-form")
//       .addEventListener("submit", (e) => {
//         e.preventDefault();
//         const email = this.container.querySelector("#login-email").value;
//         const password = this.container.querySelector("#login-password").value;
//         this.apiHandler(`${API_BASE}/login`, "POST", { email, password })
//           .then(() => {
//             this.userLoggedIn = true;
//             this.mode = "list";
//             this.init();
//           })
//           .catch((err) => alert("Login fehlgeschlagen"));
//       });
//     this.container
//       .querySelector("#btn-login-cancel")
//       .addEventListener("click", () => {
//         this.init();
//       });
//   };

//   this.printRegisterForm = function () {
//     const html = `
//       <form id="register-form" style="margin:2rem auto; max-width:320px;">
//         <input type="email" id="register-email" placeholder="Email" required class="form-input-generally form-input" style="margin-bottom:1rem;width:100%;">
//         <input type="password" id="register-password" placeholder="Passwort" required class="form-input-generally form-input" style="margin-bottom:1rem;width:100%;">
//         <button class="btn-todo" id="btn-register-submit" type="submit">Registrieren</button>
//         <button class="btn-todo" id="btn-register-cancel" type="button">Abbrechen</button>
//       </form>
//     `;
//     this.container.innerHTML = html;
//     this.container
//       .querySelector("#register-form")
//       .addEventListener("submit", (e) => {
//         e.preventDefault();
//         const email = this.container.querySelector("#register-email").value;
//         const password =
//           this.container.querySelector("#register-password").value;
//         this.apiHandler(`${API_BASE}/register`, "POST", { email, password })
//           .then(() => {
//             alert("Registrierung erfolgreich! Jetzt einloggen.");
//             this.printLoginForm();
//           })
//           .catch((err) => alert("Registrierung fehlgeschlagen"));
//       });
//     this.container
//       .querySelector("#btn-register-cancel")
//       .addEventListener("click", () => {
//         this.init();
//       });
//   };

//   this.printLogout = function () {
//     const html = `
//       <div style="text-align:right;">
//         <button class="btn-todo btn-logout" id="btn-logout">Logout</button>
//       </div>
//     `;
//     this.container.insertAdjacentHTML("afterbegin", html);
//     this.container
//       .querySelector("#btn-logout")
//       .addEventListener("click", () => {
//         this.apiHandler(`${API_BASE}/logout`, "POST").then(() => {
//           this.userLoggedIn = false;
//           this.mode = "guest";
//           this.guestStarted = false;
//           this.init();
//         });
//       });
//   };

//   // ============================================================
//   // ============================================================

//   this.printBtn = function (todo) {
//     /**
//      * ADD TODO BTN
//      */
//     if (this.mode === "list") {
//       let html = `
//         <div class="">
//           <button class="btn-todo btn-todo-add" id="btn-todo-add">Todo anlegen</button>
//         </div>
//       `;

//       this.container.insertAdjacentHTML("beforeend", html);

//       let element = this.container.querySelector("#btn-todo-add");
//       element.addEventListener("click", (event) => {
//         event.preventDefault();
//         this.resetCurrentTodo();
//         this.changeMode("form");
//       });
//     }

//     /**
//      * BACK TO LIST BTN
//      */
//     if (this.mode === "form") {
//       let html = `
//         <div class="">
//           <button class="btn-todo btn-todo-back" id="btn-todo-back">Zurück zur Todo-Liste</button>
//         </div>
//       `;

//       this.container.insertAdjacentHTML("beforeend", html);

//       let element = this.container.querySelector("#btn-todo-back");
//       element.addEventListener("click", (event) => {
//         event.preventDefault();
//         this.resetCurrentTodo();
//         this.changeMode("list");
//       });
//     }
//   };

//   // ============================================================
//   // ============================================================

//   this.printTodo = function (todo) {
//     let html = `
//       <div class="todo-item-wrapper" id="todo-item-${todo.id}">
//         <div class="todo-item">

//           <div class="form-check">
//             <input class="form-check-input" type="checkbox" id="todo-${
//               todo.id
//             }-check" ${todo.completed == 1 ? "checked" : ""}/>

//             <label class="form-check-label ${
//               todo.completed == 1 ? "todo-item-completed" : ""
//             }" id="todo-${todo.id}-check-label" for="todo-${todo.id}-check">${
//       todo.title
//     }</label>
//           </div>

//           <div class="icon-wrapper">
//             <img src="assets/img/edit_note.svg" class="note-icon note-edit" id="note-edit-${
//               todo.id
//             }" title="bearbeiten"></img>
//             <img src="assets/img/delete_note.svg" class="note-icon note-delete" id="note-delete-${
//               todo.id
//             }" title="löschen"></img>
//           </div>
//         </div>
//       </div>
//       `;

//     this.container.insertAdjacentHTML("beforeend", html);

//     /**
//      * Checkbox update
//      */
//     let checkbox = this.container.querySelector(`#todo-${todo.id}-check`);
//     checkbox.addEventListener("change", (event) => {
//       event.preventDefault();

//       let targetData = {
//         id: todo.id,
//         completed: event.target.checked ? 1 : 0,
//       };

//       this.updateTodo(targetData).then(() => {
//         let label = this.container.querySelector(
//           `#todo-${todo.id}-check-label`
//         );
//         label.classList.toggle("todo-item-completed", event.target.checked);
//       });
//     });

//     /**
//      * Edit Todo
//      */
//     let editBtn = this.container.querySelector(`#note-edit-${todo.id}`);
//     editBtn.addEventListener("click", () => {
//       this.getTodo(todo).then((json) => {
//         this.currentTodo = json;
//         this.changeMode("form");
//       });
//     });

//     /**
//      * Delete Todo
//      */
//     let deleteBtn = this.container.querySelector(`#note-delete-${todo.id}`);
//     deleteBtn.addEventListener("click", () => {
//       this.deleteTodo(todo).then(() => {
//         let todoItem = this.container.querySelector(`#todo-item-${todo.id}`);
//         todoItem.remove();
//       });
//     });
//   };

//   // ============================================================

//   this.printForm = function () {
//     let html = `
//         <div class="todo-item-wrapper">
//           <form class="todo-form" id="todo-form">

//             <div class="form-group">
//               <label for="todo-title">Titel*</label>
//               <input
//                 class="form-input-generally form-input"
//                 id="todo-title"
//                 type="text"
//                 name="title"
//                 required
//                 placeholder="Was ist zu tun?"
//                 value="${this.currentTodo.title}"
//               >
//             </div>

//             <div class="form-group">
//               <label for="todo-description">Beschreibung</label>
//               <textarea
//                 class="form-input-generally form-textarea"
//                 id="todo-description"
//                 name="description"
//                 rows="3"
//                 placeholder="Details (optional)"
//               >${this.currentTodo.description}</textarea>
//             </div>

//             <div class="form-group form-checkbox">
//               <input
//                 class="form-checkbox-input"
//                 id="todo-completed"
//                 type="checkbox"
//                 name="completed"
//                 ${this.currentTodo.completed == 1 ? "checked" : ""}
//               >
//               <label for="todo-completed">Erledigt</label>
//             </div>

//             <div class="form-actions">
//               <button class="btn-todo btn-todo-submit" id="btn-todo-submit" type="submit" disabled data-id="${
//                 this.currentTodo.id
//               }">Speichern</button>

//                ${
//                  this.currentTodo.id === 0
//                    ? `<button class="btn-todo btn-todo-submit" id="todo-submit-next" type="submit" disabled data-id="${this.currentTodo.id}">Speichern ++</button>`
//                    : ""
//                }
//             </div>

//           </form>
//         </div>
//     `;

//     this.container.insertAdjacentHTML("beforeend", html);

//     /**
//      * SAVE note
//      */
//     let form = this.container.querySelector("#btn-todo-submit");
//     form.addEventListener("click", (event) => {
//       this.saveTodoHandler(event);
//     });

//     /**
//      * SAVE note and NEXT
//      */
//     if (this.currentTodo.id === 0) {
//       let elementNext = this.container.querySelector("#todo-submit-next");
//       elementNext.addEventListener("click", (event) => {
//         this.saveTodoHandler(event, "next");
//       });
//     }

//     let titleInput = this.container.querySelector("#todo-title");
//     let submitBtn = this.container.querySelector("#btn-todo-submit");
//     let submitNextBtn = this.container.querySelector("#todo-submit-next");

//     setupFormValidation(titleInput, submitBtn, submitNextBtn);
//   };

//   this.saveTodoHandler = function (event, mode = "save") {
//     event.preventDefault();

//     let title = this.container.querySelector("#todo-title").value;
//     let description = this.container.querySelector("#todo-description").value;
//     let completed = this.container.querySelector("#todo-completed").checked;

//     let todo = {
//       id: parseInt(event.target.dataset.id),
//       title: title,
//       description,
//       completed: completed ? 1 : 0,
//     };

//     if (todo.id > 0) {
//       this.updateTodo(todo).then(() => {
//         this.changeMode("list");
//       });
//     }

//     if (todo.id === 0 && mode === "save") {
//       this.createTodo(todo).then(() => {
//         this.changeMode("list");
//       });
//     }

//     if (todo.id === 0 && mode === "next") {
//       this.createTodo(todo).then(() => {
//         this.resetCurrentTodo();
//         this.changeMode("form");
//       });
//     }
//   };

//   // ============================================================
//   // ============================================================

//   this.getAllTodos = function () {
//     this.apiHandler(`${API_BASE}/todos`, "GET").then((json) => {
//       for (let i = 0; i < json.length; i++) {
//         this.printTodo(json[i]);
//       }
//     });
//   };

//   this.getTodo = function (data) {
//     return this.apiHandler(`${API_BASE}/todos/${data.id}`, "GET").then(
//       (json) => {
//         return json;
//       }
//     );
//   };

//   this.createTodo = function (data) {
//     return this.apiHandler(`${API_BASE}/todos`, "POST", data).then((json) => {
//       return json;
//     });
//   };

//   this.updateTodo = function (data) {
//     return this.apiHandler(`${API_BASE}/todos/${data.id}`, "PATCH", data).then(
//       (json) => {
//         return json;
//       }
//     );
//   };

//   this.deleteTodo = function (data) {
//     return this.apiHandler(`${API_BASE}/todos/${data.id}`, "DELETE", data).then(
//       (json) => {
//         return json;
//       }
//     );
//   };

//   // ============================================================
//   // ================ API handler ===============================

//   /**
//    * API handler mit Cookie-Support
//    */
//   this.apiHandler = function (url, method, data = null) {
//     // doppelte Slashes verhindern
//     url = url.replace(/([^:]\/)\/+/g, "$1");

//     const options = {
//       method: method,
//       cache: "no-cache",
//       credentials: "include", // send cookies
//       headers: {
//         "Content-Type": "application/json",
//       },
//     };

//     if (data !== null) {
//       options.body = JSON.stringify(data);
//     }

//     // Debug: Print API call
//     console.log("API call:", method, url, data);

//     return fetch(url, options)
//       .then((response) => {
//         if (!response.ok) throw new Error("Netzwerkantwort war nicht ok");
//         return response.json();
//       })
//       .catch((error) => {
//         console.error("Fehler bei API-Anfrage:", error, "URL:", url);
//         throw error;
//       });
//   };
// }

// // ==================== DOM ready =============================

// document.addEventListener("DOMContentLoaded", function () {
//   const todoAppInstance = new todoApp();
//   todoAppInstance.init();
// });

// // ============================================================

// /**
//  * Form Validation for title input
//  * @param {*} titleInput
//  * @param {*} submitBtn
//  * @param {*} submitNextBtn
//  */
// function setupFormValidation(titleInput, submitBtn, submitNextBtn = null) {
//   function toggleSubmitButtons() {
//     const isEmpty = titleInput.value.trim() === "";
//     submitBtn.disabled = isEmpty;
//     if (submitNextBtn) {
//       submitNextBtn.disabled = isEmpty;
//     }
//   }
// }
"use strict";

// Basis-URL ohne abschließenden Slash
const API_BASE = "https://api-restful-notes-user-session.dev2k.org/api";

function todoApp() {
  this.container = "";
  this.mode = "guest";
  this.guestStarted = false;
  this.currentTodo = {};
  this.userLoggedIn = false;

  this.init = function () {
    this.container = document.querySelector("#content");
    this.container.innerHTML = "";

    // 1) Cookies prüfen
    const guestCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("guestId="));
    const userCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="));

    // 2) Status setzen
    this.userLoggedIn = !!userCookie;
    this.guestStarted = !!guestCookie;

    // 3) Gast-ID anzeigen (falls gesetzt)
    this.showGuestCookie();

    // 4) UI bauen
    if (!this.userLoggedIn && !this.guestStarted) {
      // Kein Cookie: Menü mit allen drei Optionen
      this.printAuthOptions();
    } else if (this.userLoggedIn) {
      this.mode = "list";
      this.printLogout();
      this.printBtn();
      this.getAllTodos();
    } else if (this.guestStarted) {
      this.mode = this.mode === "guest" ? "list" : this.mode;
      if (this.mode === "list") {
        this.printBtn();
        this.getAllTodos();
      } else if (this.mode === "form") {
        this.printBtn();
        this.printForm();
      }
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
        `<p style="font-size:0.8rem; color:#666">Gast-Session: ${guestId}</p>`
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
      // Gast-Session anfordern
      this.apiHandler(`${API_BASE}/session/guest`, "GET")
        .then(() => {
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

  this.printAuthOptions = function () {
    const html = `
    <div style="text-align:center; margin-top:2rem;">
      <button class="btn-todo btn-login" id="btn-login">Login</button>
      <button class="btn-todo btn-register" id="btn-register">Registrieren</button>
      <button class="btn-todo btn-guest" id="btn-guest">Als Gast starten</button>
    </div>
  `;
    this.container.insertAdjacentHTML("beforeend", html);

    // Login-Button
    this.container.querySelector("#btn-login").addEventListener("click", () => {
      this.printLoginForm();
    });

    // Registrieren-Button
    this.container
      .querySelector("#btn-register")
      .addEventListener("click", () => {
        this.printRegisterForm();
      });

    // Gast starten-Button
    this.container.querySelector("#btn-guest").addEventListener("click", () => {
      // Gast-Session anfordern
      this.apiHandler(`${API_BASE}/session/guest`, "GET")
        .then(() => {
          this.guestStarted = true;
          this.mode = "list";
          this.init();
        })
        .catch(console.error);
    });
  };

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
        this.apiHandler(`${API_BASE}/login`, "POST", { email, password })
          .then(() => {
            this.userLoggedIn = true;
            this.mode = "list";
            this.init();
          })
          .catch(() => alert("Login fehlgeschlagen"));
      });
    this.container
      .querySelector("#btn-login-cancel")
      .addEventListener("click", () => this.init());
  };

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
        this.apiHandler(`${API_BASE}/register`, "POST", { email, password })
          .then(() => {
            alert("Registrierung erfolgreich! Jetzt einloggen.");
            this.printLoginForm();
          })
          .catch(() => alert("Registrierung fehlgeschlagen"));
      });
    this.container
      .querySelector("#btn-register-cancel")
      .addEventListener("click", () => this.init());
  };

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
        this.apiHandler(`${API_BASE}/logout`, "POST").then(() => {
          this.userLoggedIn = false;
          this.mode = "guest";
          this.guestStarted = false;
          this.init();
        });
      });
  };

  // ============================================================

  this.printBtn = function () {
    // "Neues Todo" oder "Zurück"-Button je nach Modus
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

  // ============================================================

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

    // Checkbox-Handler
    this.container
      .querySelector(`#todo-${todo.id}-check`)
      .addEventListener("change", (e) => {
        e.preventDefault();
        this.updateTodo({
          id: todo.id,
          completed: e.target.checked ? 1 : 0,
        }).then(() => {
          this.container
            .querySelector(`#todo-${todo.id}-check-label`)
            .classList.toggle("todo-item-completed", e.target.checked);
        });
      });

    // Bearbeiten
    this.container
      .querySelector(`#note-edit-${todo.id}`)
      .addEventListener("click", () => {
        this.getTodo(todo).then((json) => {
          this.currentTodo = json;
          this.changeMode("form");
        });
      });

    // Löschen
    this.container
      .querySelector(`#note-delete-${todo.id}`)
      .addEventListener("click", () => {
        this.deleteTodo(todo).then(() => {
          this.container.querySelector(`#todo-item-${todo.id}`).remove();
        });
      });
  };

  // ============================================================

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

    // Save und Next-Handler
    this.container
      .querySelector("#btn-todo-submit")
      .addEventListener("click", (e) => this.saveTodoHandler(e));
    if (this.currentTodo.id === 0) {
      this.container
        .querySelector("#todo-submit-next")
        .addEventListener("click", (e) => this.saveTodoHandler(e, "next"));
    }

    // Formularvalidierung
    setupFormValidation(
      this.container.querySelector("#todo-title"),
      this.container.querySelector("#btn-todo-submit"),
      this.currentTodo.id === 0
        ? this.container.querySelector("#todo-submit-next")
        : null
    );
  };

  // ============================================================

  this.saveTodoHandler = function (event, mode = "save") {
    event.preventDefault();
    const title = this.container.querySelector("#todo-title").value;
    const description = this.container.querySelector("#todo-description").value;
    const completed = this.container.querySelector("#todo-completed").checked;

    const todo = {
      id: parseInt(event.target.dataset.id),
      title,
      description,
      completed: completed ? 1 : 0,
    };

    if (todo.id > 0) {
      this.updateTodo(todo).then(() => this.changeMode("list"));
    } else if (mode === "save") {
      this.createTodo(todo).then(() => this.changeMode("list"));
    } else {
      this.createTodo(todo).then(() => {
        this.resetCurrentTodo();
        this.changeMode("form");
      });
    }
  };

  // ============================================================

  this.getAllTodos = function () {
    this.apiHandler(`${API_BASE}/todos`, "GET").then((json) => {
      json.forEach((t) => this.printTodo(t));
    });
  };

  this.getTodo = (data) =>
    this.apiHandler(`${API_BASE}/todos/${data.id}`, "GET");

  this.createTodo = (data) =>
    this.apiHandler(`${API_BASE}/todos`, "POST", data);

  this.updateTodo = (data) =>
    this.apiHandler(`${API_BASE}/todos/${data.id}`, "PATCH", data);

  this.deleteTodo = (data) =>
    this.apiHandler(`${API_BASE}/todos/${data.id}`, "DELETE", data);

  // ============================================================
  // API handler mit Cookie-Support
  this.apiHandler = function (url, method, data = null) {
    url = url.replace(/([^:]\/)\/+/g, "$1"); // doppelte Slashes entfernen

    const options = {
      method,
      cache: "no-cache",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    };
    if (data !== null) options.body = JSON.stringify(data);

    console.log("API call:", method, url, data);
    return fetch(url, options)
      .then((res) => {
        if (!res.ok) throw new Error("Netzwerkantwort war nicht ok");
        return res.json();
      })
      .catch((err) => {
        console.error("Fehler bei API-Anfrage:", err, "URL:", url);
        throw err;
      });
  };
}

// DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const todoAppInstance = new todoApp();
  todoAppInstance.init();
});

/**
 * Form Validation for title input
 */
function setupFormValidation(titleInput, submitBtn, submitNextBtn = null) {
  function toggle() {
    const empty = titleInput.value.trim() === "";
    submitBtn.disabled = empty;
    if (submitNextBtn) submitNextBtn.disabled = empty;
  }
  titleInput.addEventListener("input", toggle);
  toggle();
}
