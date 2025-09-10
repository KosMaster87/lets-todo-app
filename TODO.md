# Besseres State Management (ohne Framework):

```js
// Zentraler State Store (wie ich vorhin gezeigt habe)
function AppState() {
  this.state = {
    mode: "guest",
    sessionType: null,
    todos: [],
    currentTodo: {},
    loading: false,
  };

  // Nur bei echten Änderungen UI updaten
  this.setState = function (newState) {
    const changedKeys = this.getChangedKeys(oldState, newState);
    this.updateOnlyChangedUI(changedKeys);
  };
}
```
