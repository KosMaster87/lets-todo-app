/**
 * UI Utilities - Helper functions for DOM manipulation and UI enhancements
 */

window.UIUtils = {
  /**
   * Create a loading overlay
   * @param {string} message - Loading message
   * @returns {HTMLElement} Loading overlay element
   */
  createLoadingOverlay(message = "Loading...") {
    const overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${message}</p>
        `;
    return overlay;
  },

  /**
   * Show loading overlay
   * @param {string} message - Loading message
   * @returns {HTMLElement} The created overlay element
   */
  showLoading(message = "Loading...") {
    const overlay = this.createLoadingOverlay(message);
    document.body.appendChild(overlay);
    return overlay;
  },

  /**
   * Hide loading overlay
   * @param {HTMLElement} overlay - The overlay element to remove
   */
  hideLoading(overlay) {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  },

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds
   */
  showToast(message, type = "info", duration = 5000) {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Auto remove after duration
    const timeoutId = setTimeout(() => {
      this.removeToast(toast);
    }, duration);

    // Remove on click
    toast.addEventListener("click", () => {
      clearTimeout(timeoutId);
      this.removeToast(toast);
    });

    return toast;
  },

  /**
   * Remove a toast notification
   * @param {HTMLElement} toast - Toast element to remove
   */
  removeToast(toast) {
    if (toast && toast.parentNode) {
      toast.style.animation = "slideOut 0.3s ease-in forwards";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  },

  /**
   * Animate a number counting up
   * @param {HTMLElement} element - Element to animate
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} duration - Animation duration in milliseconds
   */
  animateNumber(element, start, end, duration = 1000) {
    const range = end - start;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + range * easeOut);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  },

  /**
   * Create a confirmation dialog
   * @param {string} message - Confirmation message
   * @param {string} title - Dialog title
   * @returns {Promise<boolean>} User's choice
   */
  confirm(message, title = "Confirm") {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "loading-overlay";
      overlay.style.background = "rgba(0, 0, 0, 0.5)";

      const dialog = document.createElement("div");
      dialog.style.cssText = `
                background: white;
                border-radius: 1rem;
                padding: 2rem;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            `;

      dialog.innerHTML = `
                <h3 style="margin: 0 0 1rem 0; color: #333;">${title}</h3>
                <p style="margin: 0 0 2rem 0; color: #666; line-height: 1.5;">${message}</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="confirm-btn" style="
                        padding: 0.8rem 1.5rem;
                        border: none;
                        border-radius: 0.5rem;
                        background: #f44336;
                        color: white;
                        cursor: pointer;
                        font-weight: 600;
                    ">Yes</button>
                    <button class="cancel-btn" style="
                        padding: 0.8rem 1.5rem;
                        border: 1px solid #ddd;
                        border-radius: 0.5rem;
                        background: white;
                        color: #666;
                        cursor: pointer;
                        font-weight: 600;
                    ">Cancel</button>
                </div>
            `;

      const confirmBtn = dialog.querySelector(".confirm-btn");
      const cancelBtn = dialog.querySelector(".cancel-btn");

      const cleanup = () => {
        document.body.removeChild(overlay);
      };

      confirmBtn.addEventListener("click", () => {
        cleanup();
        resolve(true);
      });

      cancelBtn.addEventListener("click", () => {
        cleanup();
        resolve(false);
      });

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          cleanup();
          resolve(false);
        }
      });

      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
    });
  },

  /**
   * Format date for display
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return d < now ? "Yesterday" : "Tomorrow";
    } else if (diffDays < 7) {
      return d < now ? `${diffDays} days ago` : `In ${diffDays} days`;
    } else {
      return d.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  },

  /**
   * Calculate time ago from a date
   * @param {Date|string} date - Date to calculate from
   * @returns {string} Time ago string
   */
  timeAgo(date) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return "Just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  },

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function calls
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Check if element is in viewport
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} True if element is visible
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * Smooth scroll to element
   * @param {HTMLElement|string} target - Element or selector to scroll to
   * @param {number} offset - Offset from top
   */
  scrollTo(target, offset = 0) {
    const element =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!element) return;

    const elementTop = element.getBoundingClientRect().top;
    const offsetPosition = elementTop + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  },

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand("copy");
        textArea.remove();
        return result;
      }
    } catch (error) {
      console.error("Failed to copy text:", error);
      return false;
    }
  },

  /**
   * Generate a random ID
   * @param {number} length - ID length
   * @returns {string} Random ID
   */
  generateId(length = 8) {
    return Math.random().toString(36).substr(2, length);
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  },

  /**
   * Add CSS animation classes with cleanup
   * @param {HTMLElement} element - Element to animate
   * @param {string} animationClass - CSS class name
   * @param {Function} callback - Callback after animation
   */
  animate(element, animationClass, callback) {
    element.classList.add(animationClass);

    const onAnimationEnd = () => {
      element.classList.remove(animationClass);
      element.removeEventListener("animationend", onAnimationEnd);
      if (callback) callback();
    };

    element.addEventListener("animationend", onAnimationEnd);
  },
};
