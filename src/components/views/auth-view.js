/**
 * Authentication Views (Register/Login)
 * Handles user registration and login forms
 */

class AuthView {
  constructor(appState, viewManager) {
    this.appState = appState;
    this.viewManager = viewManager;
  }

  /**
   * Initialize auth views
   */
  init() {
    this.setupRegisterForm();
    this.setupLoginForm();
  }

  /**
   * Setup register form
   */
  setupRegisterForm() {
    const registerForm = this.createRegisterFormHandler();
    const cancelBtn = document.getElementById("registerCancelBtn");

    // Submit handler
    const submitBtn = document.getElementById("registerSubmitBtn");
    if (submitBtn) {
      submitBtn.addEventListener("click", registerForm);
    }

    // Cancel handler
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.clearRegisterForm();
        this.appState.navigateToView("main-menu");
      });
    }

    // Form validation on input
    this.setupRegisterValidation();
  }

  /**
   * Setup login form
   */
  setupLoginForm() {
    const loginForm = this.createLoginFormHandler();
    const cancelBtn = document.getElementById("loginCancelBtn");

    // Submit handler
    const submitBtn = document.getElementById("loginSubmitBtn");
    if (submitBtn) {
      submitBtn.addEventListener("click", loginForm);
    }

    // Cancel handler
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.clearLoginForm();
        this.appState.navigateToView("main-menu");
      });
    }

    // Form validation on input
    this.setupLoginValidation();
  }

  /**
   * Create register form handler
   */
  createRegisterFormHandler() {
    return (e) => {
      e.preventDefault();

      const formData = this.getRegisterFormData();
      const validation = this.validateRegisterForm(formData);

      if (!validation.isValid) {
        this.appState.addNotification({
          type: "error",
          message: validation.message,
        });
        return;
      }

      this.appState.setLoading(true);

      // Use TodoApp's registration method
      if (window.todoApp && window.todoApp.sessionManager) {
        window.todoApp.sessionManager
          .registerUser(formData, (url, method, data) =>
            window.todoApp.apiClient.request(url, method, data)
          )
          .then((response) => {
            this.appState.setState({
              sessionType: "user",
              userId: response.userId,
              userEmail: formData.email,
              loading: false,
            });

            this.appState.addNotification({
              type: "success",
              message: "Registrierung erfolgreich!",
            });

            this.clearRegisterForm();
            this.appState.navigateToView("dashboard");

            // Load todos
            if (window.todoApp.todoService) {
              window.todoApp.todoService.loadTodos();
            }
          })
          .catch((error) => {
            this.appState.setState({
              loading: false,
              error: "Registrierung fehlgeschlagen",
            });
          });
      }
    };
  }

  /**
   * Create login form handler
   */
  createLoginFormHandler() {
    return (e) => {
      e.preventDefault();

      const formData = this.getLoginFormData();
      const validation = this.validateLoginForm(formData);

      if (!validation.isValid) {
        this.appState.addNotification({
          type: "error",
          message: validation.message,
        });
        return;
      }

      this.appState.setLoading(true);

      // Use TodoApp's login method
      if (window.todoApp && window.todoApp.sessionManager) {
        window.todoApp.sessionManager
          .loginUser(formData, (url, method, data) =>
            window.todoApp.apiClient.request(url, method, data)
          )
          .then((response) => {
            this.appState.setState({
              sessionType: "user",
              userId: response.userId,
              userEmail: formData.email,
              loading: false,
            });

            this.appState.addNotification({
              type: "success",
              message: "Anmeldung erfolgreich!",
            });

            this.clearLoginForm();
            this.appState.navigateToView("dashboard");

            // Load todos
            if (window.todoApp.todoService) {
              window.todoApp.todoService.loadTodos();
            }
          })
          .catch((error) => {
            this.appState.setState({
              loading: false,
              error: "Anmeldung fehlgeschlagen",
            });
          });
      }
    };
  }

  /**
   * Get register form data
   */
  getRegisterFormData() {
    return {
      email: document.getElementById("registerEmail")?.value || "",
      password: document.getElementById("registerPassword")?.value || "",
      passwordConfirm:
        document.getElementById("registerPasswordConfirm")?.value || "",
      terms: document.getElementById("registerTerms")?.checked || false,
    };
  }

  /**
   * Get login form data
   */
  getLoginFormData() {
    return {
      email: document.getElementById("loginEmail")?.value || "",
      password: document.getElementById("loginPassword")?.value || "",
    };
  }

  /**
   * Validate register form
   */
  validateRegisterForm(data) {
    if (!data.email || !this.isValidEmail(data.email)) {
      return {
        isValid: false,
        message: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      };
    }

    if (!data.password || data.password.length < 6) {
      return {
        isValid: false,
        message: "Passwort muss mindestens 6 Zeichen lang sein",
      };
    }

    if (data.password !== data.passwordConfirm) {
      return {
        isValid: false,
        message: "Passwörter stimmen nicht überein",
      };
    }

    if (!data.terms) {
      return {
        isValid: false,
        message: "Bitte akzeptieren Sie die Nutzungsbedingungen",
      };
    }

    return { isValid: true };
  }

  /**
   * Validate login form
   */
  validateLoginForm(data) {
    if (!data.email || !this.isValidEmail(data.email)) {
      return {
        isValid: false,
        message: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      };
    }

    if (!data.password || data.password.length < 1) {
      return { isValid: false, message: "Bitte geben Sie Ihr Passwort ein" };
    }

    return { isValid: true };
  }

  /**
   * Setup register form validation
   */
  setupRegisterValidation() {
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const passwordConfirmInput = document.getElementById(
      "registerPasswordConfirm"
    );

    if (emailInput) {
      emailInput.addEventListener("blur", () => {
        this.validateEmailField(emailInput);
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener("input", () => {
        this.validatePasswordField(passwordInput);
        // Also validate confirm password if it has a value
        if (passwordConfirmInput && passwordConfirmInput.value) {
          this.validatePasswordConfirmField(
            passwordConfirmInput,
            passwordInput.value
          );
        }
      });
    }

    if (passwordConfirmInput) {
      passwordConfirmInput.addEventListener("input", () => {
        this.validatePasswordConfirmField(
          passwordConfirmInput,
          passwordInput.value
        );
      });
    }
  }

  /**
   * Setup login form validation
   */
  setupLoginValidation() {
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    if (emailInput) {
      emailInput.addEventListener("blur", () => {
        this.validateEmailField(emailInput);
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener("blur", () => {
        this.validatePasswordField(passwordInput);
      });
    }
  }

  /**
   * Field validators
   */
  validateEmailField(input) {
    const email = input.value;
    if (email && !this.isValidEmail(email)) {
      input.style.borderColor = "#f44336";
      return false;
    }
    input.style.borderColor = "";
    return true;
  }

  validatePasswordField(input) {
    const password = input.value;
    if (password && password.length < 6) {
      input.style.borderColor = "#f44336";
      return false;
    }
    input.style.borderColor = "";
    return true;
  }

  /**
   * Validate password confirmation field
   */
  validatePasswordConfirmField(input, password) {
    const confirm = input.value;
    if (confirm && confirm !== password) {
      input.style.borderColor = "#f44336";
      return false;
    }
    input.style.borderColor = confirm ? "#4caf50" : "";
    return true;
  }

  /**
   * Email validation helper
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Clear forms
   */
  clearRegisterForm() {
    const form =
      document.querySelector('[data-view="register"] form') ||
      document.querySelector('[data-view="register"]');
    if (form) {
      const inputs = form.querySelectorAll("input");
      inputs.forEach((input) => {
        if (input.type === "checkbox") {
          input.checked = false;
        } else {
          input.value = "";
        }
        input.style.borderColor = "";
      });
    }
  }

  clearLoginForm() {
    const form =
      document.querySelector('[data-view="login"] form') ||
      document.querySelector('[data-view="login"]');
    if (form) {
      const inputs = form.querySelectorAll("input");
      inputs.forEach((input) => {
        if (input.type === "checkbox") {
          input.checked = false;
        } else {
          input.value = "";
        }
        input.style.borderColor = "";
      });
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    console.log("AuthView cleanup");
  }
}

// Export for module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthView;
}
