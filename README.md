# Let's Todo App - Frontend

## 📲 Eine moderne Todo-App mit session

```javascript
// 📦 app.js - NUR Koordination und Modus-Management
function todoApp() {
  this.sessionManager = new SessionManager(); // Delegiert Session-Logik
  this.apiClient = new ApiClient(); // Delegiert API-Logik

  this.changeMode = function (mode) {
    this.mode = mode;
    this.buildUI(); // Koordiniert UI-Updates
  };

  this.printModeContent = function () {
    UIRenderer.renderModeButtons(this.container, this.mode, this); // Delegiert UI-Rendering
  };
}


// 📦 js/config/environment.js - NUR Environment-Management
const CONFIG = {
development: { API*BASE: "http://127.0.0.1:3000/api", DEBUG: true },
production: { API_BASE: "https://lets-todo-api.dev2k.org/api", DEBUG: false }
};

function detectEnvironment() { /* Automatische Detection \_/ }

/**
 * 📦 sessionManager.js - NUR Session-Verwaltung
 * Fizierung, die sowohl User- als auch Gast-Sessions unterstützt.
 * Das Frontend ist in Vanilla JavaScript entwickelt und kommuniziert über eine RESTful API mit dem Backend.
 * @param {} -
 * @returns {}
 */
function SessionManager() {
this.validateSession = function (apiHandler) {…};
};
```

## 🚀 Features

- **Session-Management**: User-Login und Gast-Sessions
- **RESTful API Integration**: Vollständige CRUD-Operationen für Todos
- **Responsive Design**: Mobile-friendly Interface
- **Real-time Updates**: Direkte API-Synchronisation
- **Form Validation**: Live-Validierung mit User-Feedback
- **Modular Architecture**: Saubere Trennung von Logik und Presentation

## 🏗️ Projektstruktur

```
lets-todo/
├── index.html                # Haupt-HTML-Datei
├── app.js                    # Hauptanwendung (todoApp Klasse)
├── style.css                 # Styling
├── js/                       # JavaScript-Module
│   ├── apiClient.js          # REST-API Kommunikation
│   ├── sessionManager.js     # Session-Verwaltung
│   ├── config/               # Environment-Konfiguration
│   │   └── environment.js    # Automatische API-URL Detection
│   ├── handlers/             # Event-Handler
│   │   └── eventHandlers.js
│   ├── templates/            # HTML-Templates
│   │   └── htmlTemplates.js
│   ├── ui/                   # UI-Rendering
│   │   └── uiRenderer.js
│   └── utils/                # Hilfsfunktionen
│       └── formValidation.js
├── test-cookies.html         # Cookie-Test für Development
├── test-direct.html          # API-Test für Development
└── assets/                   # Statische Assets
    ├── favicon.png
    ├── img/                  # Icons
    │   ├── delete_note.svg
    │   └── edit_note.svg
    ├── fonts/                # Custom Fonts
    └── styles/               # Zusätzliche Stylesheets
        └── comic.css
```

## 🛠️ Technologie-Stack

### Core Technologies

- **Vanilla JavaScript** (ES5/ES6)
- **HTML5** & **CSS3**
- **Function Constructors** (keine ES6 Classes)
- **Fetch API** für HTTP-Requests

### Architektur-Patterns

- **Separation of Concerns** (detailliert unten erklärt)
- **Module Pattern**
- **Observer Pattern** (Event-Handler)
- **Template Pattern** (HTML-Rendering)

### Separation of Concerns - Detailanalyse

Jedes Modul hat **eine einzige, klar definierte Verantwortlichkeit**:

```javascript
// 📦 app.js - NUR Koordination und Modus-Management
function todoApp() {
  this.sessionManager = new SessionManager(); // Delegiert Session-Logik
  this.apiClient = new ApiClient(); // Delegiert API-Logik

  this.changeMode = function (mode) {
    this.mode = mode;
    this.buildUI(); // Koordiniert UI-Updates
  };

  this.printModeContent = function () {
    UIRenderer.renderModeButtons(this.container, this.mode, this); // Delegiert UI-Rendering
  };
}

// 📦 sessionManager.js - NUR Session-Verwaltung
function SessionManager() {
  this.validateSession = function (apiHandler) {
    /* Session-Validierung */
  };
  this.isUserLoggedIn = function () {
    /* User-Status prüfen */
  };
  this.getSessionInfoHTML = function () {
    /* Session-Info generieren */
  };
}

// 📦 apiClient.js - NUR HTTP-Kommunikation
function ApiClient() {
  this.getAllTodos = function () {
    /* GET /api/todos */
  };
  this.createTodo = function (todoData) {
    /* POST /api/todos */
  };
  this.updateTodo = function (id, todoData) {
    /* PATCH /api/todos/:id */
  };
}

// 📦 uiRenderer.js - NUR DOM-Manipulation
const UIRenderer = {
  renderTodoForm: function (container, currentTodo, app) {
    // Nutzt Template + Event-Handler
    container.insertAdjacentHTML(
      "beforeend",
      HTMLTemplates.todoForm(currentTodo)
    );
    EventHandlers.setupTodoForm(container, app);
  },
};

// 📦 htmlTemplates.js - NUR HTML-Template-Generierung
const HTMLTemplates = {
  todoForm: function (currentTodo) {
    return `<form class="todo-form">...</form>`;
  },
  todoItem: function (todo) {
    return `<div class="todo-item">...</div>`;
  },
};

// 📦 eventHandlers.js - NUR Event-Management
const EventHandlers = {
  setupTodoForm: function (container, app) {
    container
      .querySelector("#btn-todo-submit")
      .addEventListener("click", (e) => {
        app.saveTodoHandler(e); // Delegiert zurück an App-Controller
      });
  },
};

// 📦 formValidation.js - NUR Formular-Validierung
const FormValidation = {
  validateEmail: function (email) {
    /* Email-Validierung */
  },
  showFieldError: function (field, message) {
    /* Error-Anzeige */
  },
};
```

**Warum das wichtig ist:**

- 🔧 **Wartbarkeit**: Bugs sind schnell lokalisierbar
- 🧪 **Testbarkeit**: Jedes Modul isoliert testbar
- 🔄 **Wiederverwendbarkeit**: Module in anderen Projekten nutzbar
- 📈 **Skalierbarkeit**: Neue Features sauber erweiterbar

## 🌐 Environment-Management

### Automatische Environment-Detection

Die App erkennt automatisch die Umgebung und wählt die passenden Einstellungen:

```javascript
// js/config/environment.js
const CONFIG = {
  development: {
    API_BASE: "http://127.0.0.1:3000/api", // Lokal für Development
    DEBUG: true, // Debug-Logs aktiviert
    COOKIE_DOMAIN: "127.0.0.1", // Lokale Cookie-Domain
  },
  production: {
    API_BASE: "https://lets-todo-api.dev2k.org/api",
    DEBUG: false, // Debug-Logs deaktiviert
    COOKIE_DOMAIN: ".dev2k.org", // Production-Domain
  },
};

// Automatische Detection:
function detectEnvironment() {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "development"; // 🔧 Development-Modus
  }
  return "production"; // 🚀 Production-Modus
}
```

### Environment-Variablen nutzen

```javascript
// Überall im Code verfügbar:
ENV.API_BASE; // "http://127.0.0.1:3000/api" oder "https://api.dev2k.org/api"
ENV.DEBUG; // true (development) oder false (production)
ENV.COOKIE_DOMAIN; // "127.0.0.1" oder ".dev2k.org"

// Beispiel-Nutzung:
if (ENV.DEBUG) {
  console.log("🔧 Debug-Info:", data);
}
```

### Development-Tools

- **test-cookies.html**: Cookie-Tests mit Browser-Kompatibilitätsprüfung
- **test-direct.html**: Direkter API-Test mit detaillierter Debug-Information
- **Automatische Debug-Logs**: Nur in Development-Modus aktiv

## 📋 Voraussetzungen

- Modern Web Browser (Chrome 60+, Firefox 55+, Safari 12+)
- Backend-Server (siehe [Backend Repository](../lets-todo-api) - Express.js API)
- **Development**: HTTP-Server (127.0.0.1) ausreichend
- **Production**: HTTPS-Verbindung für Session-Cookies erforderlich

## 🚀 Installation & Setup

### 1. Repository klonen

```bash
git clone https://github.com/KosMaster87/lets-todo-app.git
cd lets-todo-app
```

### 2. Development Server starten

#### Option A: Live Server (VS Code Extension)

1. VS Code öffnen
2. Live Server Extension installieren
3. `index.html` öffnen → "Go Live" klicken

#### Option B: Python HTTP Server

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

#### Option C: Node.js http-server

```bash
npm install -g http-server
http-server -p 8080
```

### 3. Environment-Konfiguration

**🔧 Vollautomatisch - Keine manuelle Konfiguration erforderlich!**

Die App erkennt automatisch das Environment und verwendet die entsprechenden Einstellungen:

```javascript
// ✅ Development (automatisch bei 127.0.0.1 oder localhost):
API_BASE: "http://127.0.0.1:3000/api";
DEBUG: true;
COOKIE_DOMAIN: "127.0.0.1";

// ✅ Production (automatisch bei .dev2k.org):
API_BASE: "https://lets-todo-api.dev2k.org/api";
DEBUG: false;
COOKIE_DOMAIN: ".dev2k.org";
```

**Wichtige Development-Tipps:**

- ✅ **Nutze echten Browser** (Chrome, Firefox) statt VS Code Simple Browser
- ✅ **Nutze 127.0.0.1** statt localhost für bessere Cookie-Kompatibilität
- ✅ **Backend muss auch auf 127.0.0.1:3000 laufen**
- ✅ **Test-Seiten nutzen**: `test-direct.html` für API/Cookie-Tests

## 🔧 Konfiguration

### API-Endpoints

Das Frontend kommuniziert mit folgenden Backend-Endpoints:

```javascript
// Authentifizierung
POST /api/register          // User-Registrierung
POST /api/login             // User-Login
POST /api/logout            // User-Logout
POST /api/session/guest     // Gast-Session starten
POST /api/session/guest/end // Gast-Session beenden
GET  /api/session/validate  // Session validieren

// Todo-Management
GET    /api/todos           // Alle Todos abrufen
GET    /api/todos/:id       // Einzelnes Todo abrufen
POST   /api/todos           // Todo erstellen
PATCH  /api/todos/:id       // Todo aktualisieren
DELETE /api/todos/:id       // Todo löschen
```

### Session-Management

```javascript
// Cookie-basierte Sessions
credentials: 'include'      // Für alle API-Requests erforderlich

// Session-Typen
- User-Session: Persistent, Email-basiert
- Gast-Session: Temporär, UUID-basiert
```

## 💻 Development

### Datei-Lade-Reihenfolge

Die Scripts in [`index.html`](index.html) müssen in dieser Reihenfolge geladen werden:

```html
<script src="js/config/environment.js"></script>
<!-- ⚠️ ZUERST! Alle anderen brauchen ENV -->
<script src="js/utils/formValidation.js"></script>
<script src="js/templates/htmlTemplates.js"></script>
<script src="js/handlers/eventHandlers.js"></script>
<script src="js/ui/uiRenderer.js"></script>
<script src="js/sessionManager.js"></script>
<script src="js/apiClient.js"></script>
<script src="app.js"></script>
```

### Development-Tools & Debugging

#### Test-Seiten für Development

```bash
# Cookie-Tests
http://127.0.0.1:5501/test-cookies.html    # Cookie-Funktionalität testen

# API-Tests
http://127.0.0.1:5501/test-direct.html     # API-Calls und Browser-Kompatibilität
```

#### Debug-Logging

```javascript
// Automatisch aktiv in Development (127.0.0.1/localhost)
debugLog("API-Call erfolgreich:", response); // 🔧 [DEVELOPMENT] API-Call erfolgreich: {...}

// In Production automatisch deaktiviert
```

#### Browser DevTools nutzen

```javascript
// Session-Status prüfen
console.log(window.ENV); // Environment-Konfiguration
document.cookie; // Aktuelle Cookies
```

### Coding Standards

```javascript
// Function Constructors verwenden
function MyComponent() {
  "use strict";

  this.property = "value";

  this.method = function () {
    // Implementation
  };
}

// JSDoc-Kommentare
/**
 * Beschreibung der Funktion
 * @param {string} param - Parameter-Beschreibung
 * @returns {Object} Return-Beschreibung
 */

// Deutsche Kommentare, englische Code-Namen
// Error-Handling mit try/catch oder Promise.catch()
```

### Neue Module hinzufügen

1. **JavaScript-Module**: In `js/` Verzeichnis erstellen
2. **Function Constructor**: Verwenden statt ES6 Classes
3. **Global verfügbar**: Via `window.ModuleName = ModuleName`
4. **Script-Tag**: In `index.html` hinzufügen
5. **Reihenfolge**: Abhängigkeiten beachten

## 🎯 App-Lifecycle

### 1. Initialisierung

```javascript
document.addEventListener("DOMContentLoaded", () => {
  // Environment-Detection beim App-Start
  debugLog(`App starting in ${ENVIRONMENT} mode`, {
    apiBase: ENV.API_BASE,
    debug: ENV.DEBUG,
  });

  const todoAppInstance = new todoApp();
  todoAppInstance.init();
});
```

### 2. Session-Validierung

```javascript
this.sessionManager.validateSession().then((response) => {
  // Session gültig → UI für angemeldeten User
  // Session ungültig → Authentifizierungs-Optionen
});
```

### 3. UI-Rendering

```javascript
// Modus-basiertes Rendering
switch (this.mode) {
  case "guest":
    this.printAuthOptions();
    break;
  case "list":
    this.loadAndDisplayTodos();
    break;
  case "form":
    this.renderTodoForm();
    break;
}
```

### 4. API-Kommunikation

```javascript
this.apiClient
  .getAllTodos()
  .then((todos) => {
    // UI mit Todos aktualisieren
  })
  .catch((error) => {
    // Error-Handling
  });
```

## 🐛 Debugging

### Browser DevTools

```javascript
// Konsole öffnen (F12)
console.log("🚀 App-Start: Session-Validierung...");

// Network-Tab für API-Requests überwachen
// Application-Tab für Cookies/Sessions
```

### Debug-Flags

```javascript
// In apiClient.js
const IS_DEVELOPMENT = window.location.hostname === "localhost";

if (IS_DEVELOPMENT) {
  console.log(`🔗 API ${method} ${url}`, data);
}
```

### Häufige Probleme & Lösungen

#### 🍪 **Cookie-Probleme in Development**

```bash
# ❌ Problem: Cookies werden nicht gesetzt
# ✅ Lösung: Echten Browser verwenden (nicht VS Code Simple Browser)
# ✅ Lösung: 127.0.0.1 statt localhost verwenden
# ✅ Lösung: Backend auch auf 127.0.0.1:3000 starten
```

#### 🌐 **CORS-Fehler**

```bash
# ❌ Problem: Cross-Origin Request blockiert
# ✅ Lösung: Backend CORS-Konfiguration für 127.0.0.1:5501 prüfen
# ✅ Lösung: credentials: 'include' in allen fetch-Requests
```

#### 📡 **API-Verbindung**

```bash
# ❌ Problem: API nicht erreichbar
# ✅ Lösung: Backend läuft auf 127.0.0.1:3000?
# ✅ Lösung: Environment-Detection mit test-direct.html testen
```

#### 🔧 **Development-Testing**

```bash
# Schnelle Tests:
http://127.0.0.1:5501/test-direct.html     # Vollständiger API/Cookie-Test
http://127.0.0.1:5501/test-cookies.html    # Nur Cookie-Tests
```

## 🚀 Deployment

### Production

**✅ Vollautomatisch!** Keine manuelle Konfiguration erforderlich:

- Environment wird automatisch erkannt (`.dev2k.org` → Production)
- API-URLs werden automatisch gesetzt
- Debug-Logging wird automatisch deaktiviert
- Cookie-Domains werden automatisch angepasst

### Static Hosting

```bash
# Beispiel: Netlify
netlify deploy --prod --dir .

# Beispiel: Vercel
vercel --prod

# Beispiel: GitHub Pages
# Einfach Repository pushen - GitHub Pages automatisch aktiviert
```

**Deployment-Checklist:**

- ✅ Backend auf Production-Domain verfügbar
- ✅ HTTPS für Production aktiviert (Cookie-Sicherheit)
- ✅ Frontend-Domain in Backend CORS-Liste
- ✅ Test mit Production-URL durchführen

### Environment-spezifische Konfiguration

```javascript
// js/config.js (optional)
const CONFIG = {
  development: {
    API_BASE: "http://localhost:3000/api",
    DEBUG: true,
  },
  production: {
    API_BASE: "https://lets-todo-api.dev2k.org/api",
    DEBUG: false,
  },
};
```

## 🧪 Testing

### Manual Testing Checklist

#### ✅ **Session-Management**

- [ ] **User-Registrierung** (test-direct.html oder index.html)
- [ ] **User-Login/Logout**
- [ ] **Gast-Session start/end**
- [ ] **Session-Validierung** nach Page-Reload
- [ ] **Cookie-Persistenz** über Browser-Neustarts

#### ✅ **Todo-Management**

- [ ] **Todos laden** (leere Liste bei neuer Session)
- [ ] **Todo erstellen** (Titel-Validierung)
- [ ] **Todo bearbeiten** (inline editing)
- [ ] **Todo Status ändern** (completed toggle)
- [ ] **Todo löschen**

#### ✅ **Environment-Tests**

- [ ] **Development**: `127.0.0.1:5501` → API auf `127.0.0.1:3000`
- [ ] **Production**: `.dev2k.org` → API auf `lets-todo-api.dev2k.org`
- [ ] **Debug-Logs**: Nur in Development sichtbar
- [ ] **Cookies**: Richtige Domain für jede Umgebung

#### 🛠️ **Development-Tools**

- [ ] **test-direct.html**: Vollständiger Cookie/API-Test
- [ ] **test-cookies.html**: Cookie-Funktionalität isoliert testen
- [ ] **Browser DevTools**: Session-Cookies unter Application → Cookies

---

## 📞 Support

Bei Problemen:

1. **Development-Tests**: `test-direct.html` öffnen und alle Tests durchlaufen
2. **Backend-Logs**: Backend-Terminal für Debug-Informationen prüfen
3. **Browser-Kompatibilität**: Chrome/Firefox verwenden, nicht VS Code Simple Browser
4. **Environment**: Automatische Detection über DevTools Console prüfen: `console.log(window.ENV)`

- [ ] Todo erstellen
- [ ] Todo bearbeiten
- [ ] Todo als erledigt markieren

#### 🎨 **UI/UX-Tests**

- [ ] **Responsive Design**: Mobile/Desktop-Kompatibilität
- [ ] **Form-Validierung**: Live-Validierung bei Eingaben
- [ ] **Error-Handling**: User-freundliche Fehlermeldungen
- [ ] **Loading-States**: Feedback bei API-Calls

### Browser-Kompatibilität

| Browser | Version | Status         | Todos                     |
| ------- | ------- | -------------- | ------------------------- |
| Chrome  | 60+     | ✅ Vollständig | Empfohlen für Development |
| Firefox | 55+     | ✅ Vollständig | Gute Alternative          |
| Safari  | 12+     | ✅ Vollständig | Cookie-Handling getestet  |
| Edge    | 79+     | ✅ Vollständig | Chromium-basiert          |

**⚠️ Nicht unterstützt:** VS Code Simple Browser (Cookie-Limitationen)
| Edge | 79+ | ✅ Vollständig |

## 🤝 Contributing

1. Fork das Repository
2. Feature-Branch erstellen (`git checkout -b feature/neue-funktion`)
3. Änderungen committen (`git commit -am 'Neue Funktion hinzugefügt'`)
4. Branch pushen (`git push origin feature/neue-funktion`)
5. Pull Request erstellen

### Code-Style

- **Function Constructors** statt ES6 Classes
- **JSDoc-Kommentare** für alle Funktionen
- **Deutsche Kommentare**, englische Variable-/Funktionsnamen
- **"use strict"** in jeder Datei
- **Consistent Naming**: camelCase für JavaScript, kebab-case für CSS

## 📝 License

Dieses Projekt steht unter der [MIT License](LICENSE).

## 🔗 Related Projects

- [Backend Repository](../lets-todo-api) - Express.js API Server
- [Database Schema](../lets-todo-api/README.md#database) - MariaDB Setup

## 📞 Support

Bei Fragen oder Problemen:

1. [Issues](https://github.com/KosMaster87/lets-todo-app/issues) erstellen
2. [Discussions](https://github.com/KosMaster87/lets-todo-app/discussions) für Fragen
3. Code-Review via Pull Requests

### 🚀 Backend API

**[Let's Todo Backend →](../lets-todo-api)**

- **Technologie**: Express.js mit ES6-Modulen, MariaDB
- **Features**: Multi-Database-Architecture, Environment-Detection, Pool-Management
- **API Documentation**: [Backend README](../lets-todo-api/README.md)
- **Development**: http://127.0.0.1:3000/api

### 📦 Full-Stack Development

```bash
# Gesamtes Projekt einrichten
git clone https://github.com/KosMaster87/lets-todo-api.git
git clone https://github.com/KosMaster87/lets-todo-app.git
cd lets-todo

# 1. Backend starten (Terminal 1)
cd lets-todo-api
npm install && npm run dev:db && npm run dev

# 2. Frontend starten (Terminal 2)
cd ../lets-todo-app
# VS Code Live Server: http://127.0.0.1:5501
```

### 🔗 Cross-System Integration

- **Auto-Detection**: Frontend erkennt automatisch Backend-URL
- **Cookie-Sync**: Sessions funktionieren nahtlos zwischen beiden Systemen
- **Debugging**: `test-cookies.html` und `test-direct.html` für API-Tests
- **Environment-Sync**: Development/Production wird automatisch erkannt

---

**Entwickelt mit ❤️ und Vanilla JavaScript**
