/**
 * Service Registry - Central service management for the Todo App
 * Provides dependency injection and service lifecycle management
 */

class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.initialized = false;
  }

  /**
   * Register a service in the registry
   * @param {string} name - Service name
   * @param {*} service - Service instance or factory function
   * @param {Object} options - Service options
   */
  register(name, service, options = {}) {
    if (this.services.has(name)) {
      console.warn(`Service "${name}" is already registered. Overwriting...`);
    }

    this.services.set(name, {
      instance: service,
      singleton: options.singleton !== false, // Default to singleton
      lazy: options.lazy === true, // Default to eager loading
      dependencies: options.dependencies || [],
      initialized: false,
    });

    console.log(`📦 Service registered: ${name}`);
  }

  /**
   * Get a service from the registry
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  get(name) {
    const serviceData = this.services.get(name);

    if (!serviceData) {
      throw new Error(`Service "${name}" not found in registry`);
    }

    // If it's a singleton and already initialized, return the instance
    if (serviceData.singleton && serviceData.initialized) {
      return serviceData.instance;
    }

    // Initialize the service if it's a factory function
    if (typeof serviceData.instance === "function") {
      try {
        const dependencies = this.resolveDependencies(serviceData.dependencies);
        serviceData.instance = serviceData.instance(...dependencies);
        serviceData.initialized = true;
        console.log(`🚀 Service initialized: ${name}`);
      } catch (error) {
        console.error(`Failed to initialize service "${name}":`, error);
        throw error;
      }
    } else {
      serviceData.initialized = true;
    }

    return serviceData.instance;
  }

  /**
   * Check if a service is registered
   * @param {string} name - Service name
   * @returns {boolean}
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Resolve dependencies for a service
   * @param {Array} dependencies - Array of dependency names
   * @returns {Array} Array of resolved dependencies
   */
  resolveDependencies(dependencies) {
    return dependencies.map((dep) => this.get(dep));
  }

  /**
   * Initialize all registered services
   */
  async initializeAll() {
    if (this.initialized) {
      console.warn("ServiceRegistry already initialized");
      return;
    }

    console.log("🔧 Initializing ServiceRegistry...");

    // Initialize services in dependency order
    const initOrder = this.calculateInitOrder();

    for (const serviceName of initOrder) {
      try {
        this.get(serviceName);
      } catch (error) {
        console.error(`Failed to initialize service ${serviceName}:`, error);
        throw error;
      }
    }

    this.initialized = true;
    console.log("✅ ServiceRegistry initialized successfully");
  }

  /**
   * Calculate service initialization order based on dependencies
   * @returns {Array} Array of service names in initialization order
   */
  calculateInitOrder() {
    const visited = new Set();
    const visiting = new Set();
    const order = [];

    const visit = (serviceName) => {
      if (visited.has(serviceName)) {
        return;
      }

      if (visiting.has(serviceName)) {
        throw new Error(
          `Circular dependency detected involving service: ${serviceName}`
        );
      }

      visiting.add(serviceName);

      const serviceData = this.services.get(serviceName);
      if (serviceData && serviceData.dependencies) {
        for (const dep of serviceData.dependencies) {
          if (!this.services.has(dep)) {
            throw new Error(
              `Dependency "${dep}" for service "${serviceName}" not found`
            );
          }
          visit(dep);
        }
      }

      visiting.delete(serviceName);
      visited.add(serviceName);
      order.push(serviceName);
    };

    // Visit all services
    for (const serviceName of this.services.keys()) {
      visit(serviceName);
    }

    return order;
  }

  /**
   * Get service status information
   * @returns {Object} Status information
   */
  getStatus() {
    const status = {
      totalServices: this.services.size,
      initializedServices: 0,
      services: {},
    };

    for (const [name, data] of this.services.entries()) {
      status.services[name] = {
        initialized: data.initialized,
        singleton: data.singleton,
        lazy: data.lazy,
        dependencies: data.dependencies,
      };

      if (data.initialized) {
        status.initializedServices++;
      }
    }

    return status;
  }

  /**
   * Clear all services (mainly for testing)
   */
  clear() {
    this.services.clear();
    this.initialized = false;
    console.log("🧹 ServiceRegistry cleared");
  }

  /**
   * Shutdown all services gracefully
   */
  async shutdown() {
    console.log("🔄 Shutting down ServiceRegistry...");

    for (const [name, data] of this.services.entries()) {
      if (
        data.initialized &&
        data.instance &&
        typeof data.instance.shutdown === "function"
      ) {
        try {
          await data.instance.shutdown();
          console.log(`🛑 Service ${name} shut down`);
        } catch (error) {
          console.error(`Error shutting down service ${name}:`, error);
        }
      }
    }

    this.clear();
    console.log("✅ ServiceRegistry shutdown complete");
  }
}

// Global service registry instance
window.ServiceRegistry = ServiceRegistry;
window.serviceRegistry = new ServiceRegistry();

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = ServiceRegistry;
}
