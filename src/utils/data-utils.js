/**
 * Data Utilities - Helper functions for data processing and validation
 */

window.DataUtils = {
  /**
   * Deep clone an object
   * @param {*} obj - Object to clone
   * @returns {*} Deep cloned object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map((item) => this.deepClone(item));
    }

    if (typeof obj === "object") {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result with strength and messages
   */
  validatePassword(password) {
    const result = {
      isValid: false,
      strength: "weak",
      messages: [],
    };

    if (!password) {
      result.messages.push("Password is required");
      return result;
    }

    if (password.length < 6) {
      result.messages.push("Password must be at least 6 characters long");
    }

    if (password.length < 8) {
      result.messages.push("For better security, use at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
      result.messages.push("Include at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      result.messages.push("Include at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      result.messages.push("Include at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      result.messages.push("Include at least one special character");
    }

    // Determine strength
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score >= 4) {
      result.strength = "strong";
      result.isValid = password.length >= 6;
    } else if (score >= 2) {
      result.strength = "medium";
      result.isValid = password.length >= 6;
    } else {
      result.strength = "weak";
      result.isValid = password.length >= 6;
    }

    return result;
  },

  /**
   * Sanitize input string
   * @param {string} input - Input to sanitize
   * @returns {string} Sanitized input
   */
  sanitizeInput(input) {
    if (typeof input !== "string") return "";
    return input.trim().replace(/[<>]/g, "");
  },

  /**
   * Format file size
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size string
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  /**
   * Generate random string
   * @param {number} length - String length
   * @param {string} chars - Character set to use
   * @returns {string} Random string
   */
  randomString(
    length = 10,
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  ) {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Sort array of objects by property
   * @param {Array} array - Array to sort
   * @param {string} property - Property to sort by
   * @param {string} direction - 'asc' or 'desc'
   * @returns {Array} Sorted array
   */
  sortBy(array, property, direction = "asc") {
    return array.sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];

      if (aVal < bVal) {
        return direction === "asc" ? -1 : 1;
      }
      if (aVal > bVal) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  },

  /**
   * Group array of objects by property
   * @param {Array} array - Array to group
   * @param {string} property - Property to group by
   * @returns {Object} Grouped object
   */
  groupBy(array, property) {
    return array.reduce((groups, item) => {
      const value = item[property];
      if (!groups[value]) {
        groups[value] = [];
      }
      groups[value].push(item);
      return groups;
    }, {});
  },

  /**
   * Filter array with multiple conditions
   * @param {Array} array - Array to filter
   * @param {Object} filters - Filter conditions
   * @returns {Array} Filtered array
   */
  filterMultiple(array, filters) {
    return array.filter((item) => {
      return Object.keys(filters).every((key) => {
        const filterValue = filters[key];
        const itemValue = item[key];

        if (filterValue === null || filterValue === undefined) {
          return true;
        }

        if (typeof filterValue === "string") {
          return (
            itemValue &&
            itemValue
              .toString()
              .toLowerCase()
              .includes(filterValue.toLowerCase())
          );
        }

        return itemValue === filterValue;
      });
    });
  },

  /**
   * Calculate statistics for numeric array
   * @param {Array} numbers - Array of numbers
   * @returns {Object} Statistics object
   */
  calculateStats(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return {
        count: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
      };
    }

    const validNumbers = numbers.filter(
      (n) => typeof n === "number" && !isNaN(n)
    );
    if (validNumbers.length === 0) {
      return {
        count: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
      };
    }

    const sorted = [...validNumbers].sort((a, b) => a - b);
    const count = validNumbers.length;
    const sum = validNumbers.reduce((a, b) => a + b, 0);
    const average = sum / count;
    const min = sorted[0];
    const max = sorted[count - 1];

    let median;
    if (count % 2 === 0) {
      median = (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
    } else {
      median = sorted[Math.floor(count / 2)];
    }

    return {
      count,
      sum: Math.round(sum * 100) / 100,
      average: Math.round(average * 100) / 100,
      min,
      max,
      median: Math.round(median * 100) / 100,
    };
  },

  /**
   * Convert object to query string
   * @param {Object} obj - Object to convert
   * @returns {string} Query string
   */
  toQueryString(obj) {
    return Object.keys(obj)
      .filter((key) => obj[key] !== null && obj[key] !== undefined)
      .map(
        (key) => encodeURIComponent(key) + "=" + encodeURIComponent(obj[key])
      )
      .join("&");
  },

  /**
   * Parse query string to object
   * @param {string} queryString - Query string to parse
   * @returns {Object} Parsed object
   */
  parseQueryString(queryString) {
    const params = {};
    const pairs = queryString.replace(/^\?/, "").split("&");

    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || "");
      }
    });

    return params;
  },

  /**
   * Check if object is empty
   * @param {Object} obj - Object to check
   * @returns {boolean} True if empty
   */
  isEmpty(obj) {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0;
    return Object.keys(obj).length === 0;
  },

  /**
   * Merge objects deeply
   * @param {Object} target - Target object
   * @param {...Object} sources - Source objects
   * @returns {Object} Merged object
   */
  deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  },

  /**
   * Check if value is object
   * @param {*} item - Item to check
   * @returns {boolean} True if object
   */
  isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
  },

  /**
   * Convert CSV string to array of objects
   * @param {string} csv - CSV string
   * @param {string} delimiter - Field delimiter
   * @returns {Array} Array of objects
   */
  csvToArray(csv, delimiter = ",") {
    const lines = csv.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(delimiter).map((h) => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map((v) => v.trim());
      const obj = {};

      headers.forEach((header, index) => {
        obj[header] = values[index] || "";
      });

      result.push(obj);
    }

    return result;
  },

  /**
   * Convert array of objects to CSV string
   * @param {Array} array - Array of objects
   * @param {string} delimiter - Field delimiter
   * @returns {string} CSV string
   */
  arrayToCsv(array, delimiter = ",") {
    if (!Array.isArray(array) || array.length === 0) return "";

    const headers = Object.keys(array[0]);
    const csvHeaders = headers.join(delimiter);

    const csvRows = array.map((obj) => {
      return headers
        .map((header) => {
          const value = obj[header] || "";
          // Escape quotes and wrap in quotes if contains delimiter
          const stringValue = String(value).replace(/"/g, '""');
          return stringValue.includes(delimiter)
            ? `"${stringValue}"`
            : stringValue;
        })
        .join(delimiter);
    });

    return [csvHeaders, ...csvRows].join("\n");
  },

  /**
   * Flatten nested object
   * @param {Object} obj - Object to flatten
   * @param {string} prefix - Key prefix
   * @returns {Object} Flattened object
   */
  flatten(obj, prefix = "") {
    const flattened = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (this.isObject(obj[key])) {
          Object.assign(flattened, this.flatten(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }

    return flattened;
  },
};
