/**
 * Settings/Options Components
 * Handles user preferences, account settings, and app configuration
 */

class SettingsView {
  constructor(appState, viewManager) {
    this.appState = appState;
    this.viewManager = viewManager;
  }

  /**
   * Initialize settings views
   */
  init() {
    this.setupOptionsMenu();
    this.setupPersonalDataMenu();
    this.setupChangePasswordForm();
  }

  /**
   * Setup main options menu
   */
  setupOptionsMenu() {
    // Theme toggle button
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => this.handleThemeToggle());
    }

    // Personal data button
    const personalDataBtn = document.getElementById("personalDataBtn");
    if (personalDataBtn) {
      personalDataBtn.addEventListener("click", () =>
        this.handlePersonalDataClick()
      );
    }

    // Cancel button
    const cancelBtn = document.getElementById("optionsCancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.handleOptionsCancel());
    }
  }

  /**
   * Setup personal data menu
   */
  setupPersonalDataMenu() {
    // Reset password button
    const resetPasswordBtn = document.getElementById("resetPasswordBtn");
    if (resetPasswordBtn) {
      resetPasswordBtn.addEventListener("click", () =>
        this.handleResetPasswordClick()
      );
    }

    // Download notes button
    const downloadNotesBtn = document.getElementById("downloadNotesBtn");
    if (downloadNotesBtn) {
      downloadNotesBtn.addEventListener("click", () =>
        this.handleDownloadNotes()
      );
    }

    // Upload notes button
    const uploadNotesBtn = document.getElementById("uploadNotesBtn");
    if (uploadNotesBtn) {
      uploadNotesBtn.addEventListener("click", () => this.handleUploadNotes());
    }

    // Cancel button
    const cancelBtn = document.getElementById("personalDataCancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () =>
        this.handlePersonalDataCancel()
      );
    }
  }

  /**
   * Setup change password form
   */
  setupChangePasswordForm() {
    // Submit button
    const submitBtn = document.getElementById("changePasswordSubmitBtn");
    if (submitBtn) {
      submitBtn.addEventListener("click", (e) => this.handlePasswordChange(e));
    }

    // Cancel button
    const cancelBtn = document.getElementById("changePasswordCancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () =>
        this.handlePasswordChangeCancel()
      );
    }

    // Form validation
    this.setupPasswordValidation();
  }

  /**
   * Setup password form validation
   */
  setupPasswordValidation() {
    const currentPasswordInput = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    if (currentPasswordInput) {
      currentPasswordInput.addEventListener("blur", () =>
        this.validateCurrentPassword()
      );
    }

    if (newPasswordInput) {
      newPasswordInput.addEventListener("input", () =>
        this.validateNewPassword()
      );
    }

    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener("blur", () =>
        this.validatePasswordConfirmation()
      );
    }
  }

  /**
   * Handle theme toggle
   */
  handleThemeToggle() {
    const state = this.appState.getState();
    const currentTheme = state.theme || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";

    // Update app state
    this.appState.setState({ theme: newTheme });

    // Apply theme to DOM
    document.body.setAttribute("data-theme", newTheme);

    // Store preference
    this.storeThemePreference(newTheme);

    this.appState.addNotification({
      type: "success",
      message: `${newTheme === "dark" ? "Dunkles" : "Helles"} Theme aktiviert`,
    });

    // Update button text/icon
    this.updateThemeButtonDisplay(newTheme);
  }

  /**
   * Update theme button display
   */
  updateThemeButtonDisplay(theme) {
    const themeBtn = document.getElementById("themeToggleBtn");
    if (!themeBtn) return;

    const btnContent = themeBtn.querySelector(".btn-content h3");
    const btnDescription = themeBtn.querySelector(".btn-content p");

    if (btnContent && btnDescription) {
      if (theme === "dark") {
        btnContent.textContent = "Light Mode aktivieren";
        btnDescription.textContent = "Zum hellen Design wechseln";
      } else {
        btnContent.textContent = "Dark Mode aktivieren";
        btnDescription.textContent = "Zum dunklen Design wechseln";
      }
    }
  }

  /**
   * Store theme preference
   */
  storeThemePreference(theme) {
    try {
      localStorage.setItem("todoapp-theme", theme);
    } catch (error) {
      console.warn("Could not save theme preference:", error);
    }
  }

  /**
   * Load theme preference
   */
  loadThemePreference() {
    try {
      const savedTheme = localStorage.getItem("todoapp-theme") || "light";
      this.appState.setState({ theme: savedTheme });
      document.body.setAttribute("data-theme", savedTheme);
      this.updateThemeButtonDisplay(savedTheme);
      return savedTheme;
    } catch (error) {
      console.warn("Could not load theme preference:", error);
      return "light";
    }
  }

  /**
   * Handle download notes
   */
  handleDownloadNotes() {
    const state = this.appState.getState();
    const todos = state.todos || [];
    const trashedTodos = state.trashedTodos || [];

    const exportData = {
      todos: todos,
      trashedTodos: trashedTodos,
      exportDate: new Date().toISOString(),
      version: "1.0",
      userEmail: state.userEmail,
    };

    this.downloadAsFile(exportData, "todos-backup.json");

    this.appState.addNotification({
      type: "success",
      message: `${todos.length} Todos erfolgreich heruntergeladen`,
    });
  }

  /**
   * Handle upload notes
   */
  handleUploadNotes() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.multiple = false;

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          this.processImportedData(importData);
        } catch (error) {
          this.appState.addNotification({
            type: "error",
            message:
              "Ungültiges Dateiformat. Bitte wählen Sie eine gültige Backup-Datei.",
          });
        }
      };

      reader.onerror = () => {
        this.appState.addNotification({
          type: "error",
          message: "Fehler beim Lesen der Datei",
        });
      };

      reader.readAsText(file);
    };

    input.click();
  }

  /**
   * Process imported data
   */
  processImportedData(importData) {
    if (!this.validateImportData(importData)) {
      this.appState.addNotification({
        type: "error",
        message: "Ungültige Backup-Datei. Datenstruktur nicht erkannt.",
      });
      return;
    }

    const todosCount = importData.todos ? importData.todos.length : 0;
    const confirmMessage = `${todosCount} Todos gefunden. Sollen diese importiert werden? Bestehende Todos werden nicht überschrieben.`;

    if (confirm(confirmMessage)) {
      this.importTodos(importData.todos || []);
    }
  }

  /**
   * Validate import data structure
   */
  validateImportData(data) {
    return (
      data &&
      typeof data === "object" &&
      Array.isArray(data.todos) &&
      data.version
    );
  }

  /**
   * Import todos
   */
  importTodos(todos) {
    if (!window.todoApp || !window.todoApp.todoService) {
      this.appState.addNotification({
        type: "error",
        message: "Import-Service nicht verfügbar",
      });
      return;
    }

    let importedCount = 0;
    let errorCount = 0;

    const importPromises = todos.map((todo) => {
      // Create new todo without ID to avoid conflicts
      const todoData = {
        title: todo.title,
        description: todo.description,
        completed: todo.completed || 0,
        priority: todo.priority || 0,
      };

      return window.todoApp.todoService
        .createTodo(todoData)
        .then(() => {
          importedCount++;
        })
        .catch(() => {
          errorCount++;
        });
    });

    Promise.allSettled(importPromises).then(() => {
      if (importedCount > 0) {
        this.appState.addNotification({
          type: "success",
          message: `${importedCount} Todos erfolgreich importiert${
            errorCount > 0 ? ` (${errorCount} Fehler)` : ""
          }`,
        });
      } else {
        this.appState.addNotification({
          type: "error",
          message: "Keine Todos konnten importiert werden",
        });
      }
    });
  }

  /**
   * Handle password change
   */
  handlePasswordChange(e) {
    e.preventDefault();

    const passwordData = this.getPasswordFormData();
    const validation = this.validatePasswordForm(passwordData);

    if (!validation.isValid) {
      this.appState.addNotification({
        type: "error",
        message: validation.message,
      });
      return;
    }

    this.appState.setLoading(true);

    // TODO: Implement password change API call
    this.changePassword(passwordData)
      .then(() => {
        this.appState.setState({ loading: false });
        this.appState.addNotification({
          type: "success",
          message: "Passwort erfolgreich geändert",
        });
        this.clearPasswordForm();
        this.appState.navigateToView("personal-data");
      })
      .catch((error) => {
        this.appState.setState({
          loading: false,
          error: "Passwort konnte nicht geändert werden",
        });
      });
  }

  /**
   * Change password (API call)
   */
  changePassword(passwordData) {
    // TODO: Implement actual API call
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        // For now, just resolve
        resolve();
      }, 1000);
    });
  }

  /**
   * Get password form data
   */
  getPasswordFormData() {
    return {
      currentPassword: document.getElementById("currentPassword")?.value || "",
      newPassword: document.getElementById("newPassword")?.value || "",
      confirmPassword: document.getElementById("confirmPassword")?.value || "",
    };
  }

  /**
   * Validate password form
   */
  validatePasswordForm(data) {
    if (!data.currentPassword) {
      return { isValid: false, message: "Aktuelles Passwort ist erforderlich" };
    }

    if (!data.newPassword || data.newPassword.length < 6) {
      return {
        isValid: false,
        message: "Neues Passwort muss mindestens 6 Zeichen lang sein",
      };
    }

    if (data.newPassword !== data.confirmPassword) {
      return { isValid: false, message: "Passwörter stimmen nicht überein" };
    }

    if (data.currentPassword === data.newPassword) {
      return {
        isValid: false,
        message: "Neues Passwort muss sich vom aktuellen unterscheiden",
      };
    }

    return { isValid: true };
  }

  /**
   * Individual field validators
   */
  validateCurrentPassword() {
    const input = document.getElementById("currentPassword");
    if (!input) return true;

    const value = input.value;
    if (value && value.length < 1) {
      input.style.borderColor = "#f44336";
      return false;
    }

    input.style.borderColor = "";
    return true;
  }

  validateNewPassword() {
    const input = document.getElementById("newPassword");
    if (!input) return true;

    const value = input.value;
    if (value && value.length < 6) {
      input.style.borderColor = "#f44336";
      return false;
    }

    input.style.borderColor = "";
    this.validatePasswordConfirmation(); // Re-validate confirmation
    return true;
  }

  validatePasswordConfirmation() {
    const newPasswordInput = document.getElementById("newPassword");
    const confirmInput = document.getElementById("confirmPassword");

    if (!newPasswordInput || !confirmInput) return true;

    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmInput.value;

    if (confirmPassword && newPassword !== confirmPassword) {
      confirmInput.style.borderColor = "#f44336";
      return false;
    }

    confirmInput.style.borderColor = "";
    return true;
  }

  /**
   * Clear password form
   */
  clearPasswordForm() {
    const inputs = ["currentPassword", "newPassword", "confirmPassword"];
    inputs.forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.value = "";
        input.style.borderColor = "";
      }
    });
  }

  /**
   * Download as file utility
   */
  downloadAsFile(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
  }

  /**
   * Navigation handlers
   */
  handlePersonalDataClick() {
    this.appState.navigateToView("personal-data");
  }

  handleResetPasswordClick() {
    this.appState.navigateToView("change-password");
  }

  handleOptionsCancel() {
    const state = this.appState.getState();
    if (state.sessionType) {
      this.appState.navigateToView("dashboard");
    } else {
      this.appState.navigateToView("main-menu");
    }
  }

  handlePersonalDataCancel() {
    this.appState.navigateToView("options");
  }

  handlePasswordChangeCancel() {
    this.clearPasswordForm();
    this.appState.navigateToView("personal-data");
  }

  /**
   * View activation handlers
   */
  onOptionsViewActivated() {
    this.loadThemePreference();
  }

  onPersonalDataViewActivated() {
    // Could load user data here
    const state = this.appState.getState();
    console.log("Personal data view activated for user:", state.userEmail);
  }

  onChangePasswordViewActivated() {
    this.clearPasswordForm();
  }

  /**
   * Cleanup
   */
  cleanup() {
    console.log("SettingsView cleanup");
  }
}

// Export for module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = SettingsView;
}
