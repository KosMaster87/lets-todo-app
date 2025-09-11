/**
 * Service Barrel Export
 * Central export point for all service modules
 */

// Import all services (if using ES6 modules in the future)
// For now, services are loaded via script tags

/**
 * Service Registry
 * Central registry for all application services
 */
class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.initialized = false;
  }

  /**
   * Register a service
   */
  register(name, serviceInstance) {
    this.services.set(name, serviceInstance);
    console.log(`📋 Service registered: ${name}`);
  }

  /**
   * Get a service by name
   */
  get(name) {
    return this.services.get(name);
  }

  /**
   * Check if service exists
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Initialize all services
   */
  async initializeAll(appState) {
    if (this.initialized) return;

    console.log("🔧 Initializing all services...");

    try {
      // Initialize services that need app state
      for (const [name, service] of this.services) {
        if (service.init && typeof service.init === "function") {
          await service.init(appState);
          console.log(`✓ Service initialized: ${name}`);
        }
      }

      this.initialized = true;
      console.log("✅ All services initialized");
    } catch (error) {
      console.error("❌ Service initialization failed:", error);
      throw error;
    }
  }

  /**
   * Cleanup all services
   */
  cleanupAll() {
    console.log("🧹 Cleaning up all services...");

    for (const [name, service] of this.services) {
      if (service.cleanup && typeof service.cleanup === "function") {
        service.cleanup();
        console.log(`✓ Service cleaned up: ${name}`);
      }
    }

    this.services.clear();
    this.initialized = false;
    console.log("✅ All services cleaned up");
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      serviceCount: this.services.size,
      services: Array.from(this.services.keys()),
    };
  }
}

// Create global service registry
const serviceRegistry = new ServiceRegistry();

// Make available globally
if (typeof window !== "undefined") {
  window.serviceRegistry = serviceRegistry;
}

// Export for module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = serviceRegistry;
}
