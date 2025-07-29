````instructions
# Copilot Instructions für das Frontend (todoApp.js)

## Allgemeine Vorgaben

- Schreibe alle Kommentare und Fehlermeldungen auf Deutsch.
- Halte dich an die bestehende Struktur und Syntax der vorhandenen Dateien.
- Nutze ES6+ Syntax, aber ohne Module (klassisches Browser-JS).
- Keine externen Frameworks oder Libraries verwenden.
- Schreibe alle Funktionen und Variablen im camelCase.
- Verwende Strings bevorzugt mit doppelten Anführungszeichen (`"`).

## Code-Stil

- Einrückung: 2 Leerzeichen.
- Semikolons am Zeilenende verwenden.
- Funktions- und Variablennamen im camelCase.
- Konstanten in GROSSBUCHSTABEN nur, wenn sie wirklich konstant sind.
- Kommentare auf Deutsch.

## Architektur

- Die App arbeitet clientseitig und kommuniziert mit einer REST-API.
- Es gibt zwei Modi: Gast-Session (Cookie `guestId`) **oder** User-Session (Cookie `userId`).
- Registrierung und Login über eigene Views/Formulare.
- Nach Login/Registrierung: Cookie setzen, User-Modus aktivieren.
- API-URL ist in der Konstanten `API_BASE` definiert.
- API-Kommunikation immer mit `credentials: "include"` (Cookies werden gesendet).

## Sicherheit & Best Practices

- Keine sensiblen Daten im LocalStorage oder in der Konsole loggen.
- Fehler bei API-Anfragen immer abfangen und auf Deutsch ausgeben.
- Formulareingaben validieren (z. B. Titel darf nicht leer sein).
- Keine Inline-Eventhandler im HTML, sondern immer per JS registrieren.

## Fehlerbehandlung

- Fehler bei API-Anfragen im Frontend immer mit einer deutschen Fehlermeldung in der Konsole ausgeben.
- Bei fehlgeschlagenen Requests eine sinnvolle Rückmeldung an den Nutzer anzeigen (optional).

## UI/UX

- Buttons und Formulare barrierearm gestalten (Labels, ARIA-Attribute wo sinnvoll).
- Nach dem Anlegen/Bearbeiten/Löschen eines Todos die Liste automatisch aktualisieren.
- Die aktuelle Gast-ID im UI anzeigen, wenn vorhanden.

## API-Kommunikation

```javascript
// API-Handler Beispiel
this.apiHandler = function (url, method, data = null) {
  url = url.replace(/([^:]\/)\/+/g, "$1");
  const options = {
    method: method,
    cache: "no-cache",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };
  if (data !== null) options.body = JSON.stringify(data);
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
```

## Routen-Spezifikation (API)

```javascript
GET    /api/todos      - Alle Todos laden
GET    /api/todos/:id  - Einzelnes Todo
POST   /api/todos      - Todo erstellen
PATCH  /api/todos/:id  - Todo teilweise aktualisieren
DELETE /api/todos/:id  - Todo löschen
POST   /api/register   - User registrieren (E-Mail, Passwort)
POST   /api/login      - Login (E-Mail, Passwort)
POST   /api/logout     - Logout (Cookie löschen)
```

## Sonstiges

- Schreibe kurze, prägnante Commit-Messages auf Deutsch.
- Dokumentiere neue Umgebungsvariablen oder API-Änderungen in einer README.md.

---

# Tech Debt & Optimierungen

```PlainText
- [ ] **Bessere Fehleranzeige im UI**: Fehler nicht nur in der Konsole, sondern auch im DOM anzeigen
- [ ] **Barrierefreiheit**: ARIA-Attribute und Tastatursteuerung verbessern
- [ ] **Code-Struktur**: todoApp als ES6-Klasse refaktorieren
- [ ] **Tests**: Frontend-Tests mit z. B. Jest oder Cypress ergänzen
```

# Lizenz & Style

```javascript
Comment-Style: Deutsch
Error-Messages: Deutsch
````
