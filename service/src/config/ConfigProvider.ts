export default class ConfigProvider {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static getNodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  static isProduction(): boolean {
    return ConfigProvider.getNodeEnv() === 'production';
  }

  static isTest(): boolean {
    return ConfigProvider.getNodeEnv() === 'test';
  }

  static getMongoUri(): string {
    return process.env.MONGO_URI || 'mongodb://localhost:27017/p2piano';
  }

  static getPort(): number {
    return parseInt(process.env.PORT || '3000', 10);
  }

  static getCookieSecret(): string {
    const secret = process.env.COOKIE_SECRET;
    
    if (ConfigProvider.isProduction() && !secret) {
      throw new Error('COOKIE_SECRET environment variable is required in production');
    }
    
    // In development, provide a warning if using default secret
    if (!ConfigProvider.isProduction() && !secret) {
      console.warn('WARNING: Using default COOKIE_SECRET. Set COOKIE_SECRET environment variable for security.');
    }
    
    return secret || 'p2piano-cookie-secret-change-in-production';
  }

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