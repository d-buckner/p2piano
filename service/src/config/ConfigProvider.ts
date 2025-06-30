/**
 * Central configuration provider for application settings.
 * 
 * Manages environment variables, validates configuration, and provides
 * type-safe access to application settings with appropriate defaults
 * for development environments.
 * 
 * @example
 * ```typescript
 * // Validate environment before app start
 * ConfigProvider.validateEnvironment();
 * 
 * // Get configuration values
 * const dbUri = ConfigProvider.getMongoUri();
 * const isProduction = ConfigProvider.isProduction();
 * ```
 */
export default class ConfigProvider {
  private constructor() {}

  /**
   * Gets the current Node.js environment.
   * @returns The NODE_ENV value or 'development' as default
   */
  static getNodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  /**
   * Checks if the application is running in production mode.
   * @returns True if NODE_ENV is 'production'
   */
  static isProduction(): boolean {
    return ConfigProvider.getNodeEnv() === 'production';
  }

  /**
   * Checks if the application is running in test mode.
   * @returns True if NODE_ENV is 'test'
   */
  static isTest(): boolean {
    return ConfigProvider.getNodeEnv() === 'test';
  }

  /**
   * Gets the MongoDB connection URI.
   * @returns MongoDB URI from environment or localhost default
   */
  static getMongoUri(): string {
    return process.env.MONGO_URI || 'mongodb://localhost:27017/p2piano';
  }

  /**
   * Gets the server port number.
   * @returns Port number from environment or 3001 as default
   */
  static getPort(): number {
    return parseInt(process.env.PORT || '3001', 10);
  }

  /**
   * Gets the cookie signing secret with validation.
   * @returns Cookie secret string
   * @throws Error if secret is missing in production
   */
  static getCookieSecret(): string {
    const secret = process.env.COOKIE_SECRET;
    
    if (ConfigProvider.isProduction() && !secret) {
      throw new Error('COOKIE_SECRET environment variable is required in production');
    }
    
    // In development, provide a warning if using default secret
    if (!ConfigProvider.isProduction() && !secret) {
      // Note: We can't use Logger here as it may not be initialized yet during bootstrap
      console.warn('WARNING: Using default COOKIE_SECRET. Set COOKIE_SECRET environment variable for security.');
    }
    
    return secret || 'p2piano-cookie-secret-change-in-production';
  }

  /**
   * Validates all required environment variables for the current environment.
   * 
   * In production, validates that critical secrets are present and meet
   * minimum security requirements. Also validates MongoDB URI format.
   * 
   * @throws Error with detailed validation messages if any checks fail
   */
  static validateEnvironment(): void {
    const errors: string[] = [];
    
    if (ConfigProvider.isProduction()) {
      // Critical environment variables required in production
      if (!process.env.COOKIE_SECRET) {
        errors.push('COOKIE_SECRET is required in production');
      }
      
      if (!process.env.MONGO_URI) {
        errors.push('MONGO_URI is required in production');
      }
      
      // Validate COOKIE_SECRET strength in production
      const secret = process.env.COOKIE_SECRET;
      if (secret && secret.length < 32) {
        errors.push('COOKIE_SECRET must be at least 32 characters long in production');
      }
    }
    
    // Validate MONGO_URI format if provided
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri && !mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      errors.push('MONGO_URI must be a valid MongoDB connection string');
    }
    
    if (errors.length > 0) {
      throw new Error(`Environment validation failed:\n${errors.map(error => `  - ${error}`).join('\n')}`);
    }
  }
}