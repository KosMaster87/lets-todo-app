# Frontend Copilot Instructions - Let's Todo App

## Projektstruktur

```
lets-todo-app/
├── index.html              # Haupt-HTML Datei
├── style.css              # Styling
├── app.js                 # Haupt-Anwendungslogik (todoApp Klasse)
├── js/
│   ├── apiClient.js       # REST-API Kommunikation
│   ├── sessionManager.js  # Session-Management
│   ├── config/            # Environment-Konfiguration
│   │   └── environment.js
│   ├── handlers/          # Event-Handler
│   │   └── eventHandlers.js
│   ├── templates/         # HTML-Templates
│   │   └── htmlTemplates.js
│   ├── ui/               # UI-Rendering
│   │   └── uiRenderer.js
│   └── utils/            # Hilfsfunktionen
│       └── formValidation.js
├── test-cookies.html      # Cookie-Test für Development
├── test-direct.html       # Direkter API-Test für Development
└── assets/
    ├── favicon.png
    ├── img/              # Icons (SVG)
    │   ├── delete_note.svg
    │   └── edit_note.svg
    └── styles/           # Zusätzliche Stylesheets
        └── comic.css
```

## Architektur-Prinzipien

### 1. Separation of Concerns

- **app.js**: Hauptanwendung, UI-Koordination und Modus-Management
- **sessionManager.js**: Session-Status, User-Informationen und Session-Validierung
- **apiClient.js**: Alle REST-API Kommunikation mit Error-Handling
- **js/config/environment.js**: Environment Detection und API-URL Management
- **uiRenderer.js**: UI-Rendering und DOM-Manipulation
- **htmlTemplates.js**: HTML-Template Generierung
- **eventHandlers.js**: Event-Management und User-Interaktionen
- **formValidation.js**: Formular-Validierung und User-Feedback
- **index.html**: Minimale HTML-Struktur mit Script-Lade-Reihenfolge
- **style.css**: Komplettes Styling für alle UI-Komponenten

### 2. Coding Standards

- Verwende **Function Constructors** (nicht ES6 Classes)
- JSDoc-Kommentare für alle öffentlichen Funktionen
- Deutsche Kommentare, englische Code-Bezeichnungen
- "use strict" in jeder Datei
- Fehlerbehandlung mit try/catch oder Promise.catch()
- Konsistente Namenskonvention: camelCase für JavaScript, kebab-case für CSS

### 3. API-Integration

- Alle API-Calls über `ApiClient` Klasse
- Session-Management über `SessionManager` Klasse
- Environment-Detection über `js/config/environment.js`
- Automatische API-URL-Auswahl (Development: `127.0.0.1:3000`, Production: `.dev2k.org`)
- Credentials: 'include' für Cookie-basierte Sessions
- Einheitliches Error-Handling mit `setErrorHandler` Callback
- Promise-basierte API-Kommunikation

### 4. UI-Patterns

- Modus-basiertes UI-Management (guest/list/form) in app.js
- Dynamisches HTML-Rendering über UIRenderer mit HTMLTemplates
- Event-Delegation für dynamische Todo-Items über EventHandlers
- Form-Validierung mit Live-Updates über FormValidation
- Error-Display über zentralen showError Handler

## Neue Dateien erstellen

### Wenn du neue JavaScript-Module erstellst:

1. Erstelle sie im `js/` Verzeichnis
2. Verwende Function Constructors
3. Füge JSDoc-Kommentare hinzu
4. Aktualisiere `index.html` mit Script-Tag
5. Berücksichtige Lade-Reihenfolge der Abhängigkeiten

### Script-Lade-Reihenfolge (kritisch):

```html
<script src="js/config/environment.js"></script>
<script src="js/utils/formValidation.js"></script>
<script src="js/templates/htmlTemplates.js"></script>
<script src="js/handlers/eventHandlers.js"></script>
<script src="js/ui/uiRenderer.js"></script>
<script src="js/sessionManager.js"></script>
<script src="js/apiClient.js"></script>
<script src="app.js"></script>
```

**WICHTIG:** `environment.js` muss zuerst geladen werden, da alle anderen Module `ENV` verwenden.

### Wenn du Hilfsfunktionen hinzufügst:

1. Erstelle sie in `js/utils/`
2. Verwende standalone Funktionen (nicht in Klassen)
3. Exportiere über globale Variablen (kein ES6 modules)

### UI-Module Architektur:

- **HTMLTemplates**: Generiert HTML-Strings
- **UIRenderer**: Nutzt HTMLTemplates und rendert ins DOM
- **EventHandlers**: Verwaltet alle Event-Listener
- **FormValidation**: Validiert Formulareingaben

### Module-Integration Pattern:

```javascript
// UIRenderer nutzt HTMLTemplates
UIRenderer.renderTodoForm = function (container, todo, app) {
  const formHTML = HTMLTemplates.getTodoFormTemplate(todo);
  container.insertAdjacentHTML("beforeend", formHTML);
  EventHandlers.attachTodoFormHandlers(container, app);
};
```

## Environment-Management

### Automatische Environment-Detection

```javascript
// js/config/environment.js
const CONFIG = {
  development: {
    API_BASE: "http://127.0.0.1:3000/api",
    DEBUG: true,
    COOKIE_DOMAIN: "127.0.0.1",
  },
  production: {
    API_BASE: "https://lets-todo-api.dev2k.org/api",
    DEBUG: false,
    COOKIE_DOMAIN: ".dev2k.org",
  },
};

// Automatische Detection:
function detectEnvironment() {
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "development";
  }
  return "production";
}
```

### Environment-Variable nutzen

```javascript
// In allen Modulen verfügbar:
ENV.API_BASE; // API-URL
ENV.DEBUG; // Debug-Modus
ENV.COOKIE_DOMAIN; // Cookie-Domain
```

### Development-Tools

- **test-cookies.html**: Cookie-Tests für Development
- **test-direct.html**: Direkter API-Test mit Debug-Info
- Live-Logging über `debugLog()` nur in Development

## API-Endpoints (Backend-Referenz)

- `GET /api/session/validate` - Session validieren
- `POST /api/login` - Login
- `POST /api/register` - Registrierung
- `POST /api/logout` - Logout
- `POST /api/session/guest` - Gast-Session starten
- `POST /api/session/guest/end` - Gast-Session beenden
- `GET /api/todos` - Alle Todos
- `GET /api/todos/:id` - Einzelnes Todo
- `POST /api/todos` - Todo erstellen
- `PATCH /api/todos/:id` - Todo aktualisieren
- `DELETE /api/todos/:id` - Todo löschen

## Debugging & Development

- Browser DevTools für Frontend-Debugging
- Environment-Detection automatisch via `js/config/environment.js`
- Debug-Logging über `debugLog()` nur in Development-Modus
- **test-cookies.html**: Cookie-Funktionalität testen
- **test-direct.html**: API-Kommunikation und Browser-Verhalten testen
- Console.log für API-Responses
- Network-Tab für API-Request Monitoring
- Session-Status wird in SessionManager verwaltet

## Wichtige Hinweise

- **Environment wird automatisch erkannt** - keine manuelle Konfiguration nötig
- Immer `credentials: 'include'` für API-Requests
- Error-Handler in ApiClient registrieren
- Session-Status über SessionManager prüfen
- UI-Updates nur über app.js koordinieren
- **Development**: Teste immer mit echtem Browser (nicht VS Code Simple Browser)
- **Development**: Verwende `127.0.0.1` statt `localhost` für Cookie-Kompatibilität
- **Production**: Beide Services (.dev2k.org) unter derselben Domain
