import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConfigProvider from './ConfigProvider';

describe('ConfigProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment to clean state
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getNodeEnv', () => {
    it('should return NODE_ENV when set', () => {
      process.env.NODE_ENV = 'production';
      expect(ConfigProvider.getNodeEnv()).toBe('production');
    });

    it('should return development as default', () => {
      delete process.env.NODE_ENV;
      expect(ConfigProvider.getNodeEnv()).toBe('development');
    });
  });

  describe('isProduction', () => {
    it('should return true when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      expect(ConfigProvider.isProduction()).toBe(true);
    });

    it('should return false when NODE_ENV is not production', () => {
      process.env.NODE_ENV = 'development';
      expect(ConfigProvider.isProduction()).toBe(false);
    });
  });

  describe('isTest', () => {
    it('should return true when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      expect(ConfigProvider.isTest()).toBe(true);
    });

    it('should return false when NODE_ENV is not test', () => {
      process.env.NODE_ENV = 'development';
      expect(ConfigProvider.isTest()).toBe(false);
    });
  });

  describe('getMongoUri', () => {
    it('should return MONGO_URI when set', () => {
      process.env.MONGO_URI = 'mongodb://custom:27017/test';
      expect(ConfigProvider.getMongoUri()).toBe('mongodb://custom:27017/test');
    });

    it('should return default when MONGO_URI not set', () => {
      delete process.env.MONGO_URI;
      expect(ConfigProvider.getMongoUri()).toBe('mongodb://localhost:27017/p2piano');
    });
  });

  describe('getPort', () => {
    it('should return PORT when set', () => {
      process.env.PORT = '8080';
      expect(ConfigProvider.getPort()).toBe(8080);
    });

    it('should return 3001 as default', () => {
      delete process.env.PORT;
      expect(ConfigProvider.getPort()).toBe(3001);
    });

    it('should parse PORT as integer', () => {
      process.env.PORT = '9000';
      expect(ConfigProvider.getPort()).toBe(9000);
    });
  });

  describe('getCookieSecret', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should return COOKIE_SECRET when set', () => {
      process.env.COOKIE_SECRET = 'my-secret-key';
      expect(ConfigProvider.getCookieSecret()).toBe('my-secret-key');
    });

    it('should throw error in production when COOKIE_SECRET missing', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.COOKIE_SECRET;
      
      expect(() => ConfigProvider.getCookieSecret()).toThrow(
        'COOKIE_SECRET environment variable is required in production'
      );
    });

    it('should warn and return default in development when COOKIE_SECRET missing', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.COOKIE_SECRET;
      
      const result = ConfigProvider.getCookieSecret();
      
      expect(result).toBe('p2piano-cookie-secret-change-in-production');
      expect(consoleSpy).toHaveBeenCalledWith(
        'WARNING: Using default COOKIE_SECRET. Set COOKIE_SECRET environment variable for security.'
      );
    });

    it('should not warn in development when COOKIE_SECRET is set', () => {
      process.env.NODE_ENV = 'development';
      process.env.COOKIE_SECRET = 'custom-secret';
      
      ConfigProvider.getCookieSecret();
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('validateEnvironment', () => {
    it('should pass validation in development with minimal config', () => {
      process.env.NODE_ENV = 'development';
      
      expect(() => ConfigProvider.validateEnvironment()).not.toThrow();
    });

    it('should require COOKIE_SECRET in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.COOKIE_SECRET;
      delete process.env.MONGO_URI;
      
      expect(() => ConfigProvider.validateEnvironment()).toThrow(
        'Environment validation failed:\n  - COOKIE_SECRET is required in production\n  - MONGO_URI is required in production'
      );
    });

    it('should validate COOKIE_SECRET length in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.COOKIE_SECRET = 'short';
      process.env.MONGO_URI = 'mongodb://localhost:27017/test';
      
      expect(() => ConfigProvider.validateEnvironment()).toThrow(
        'COOKIE_SECRET must be at least 32 characters long in production'
      );
    });

    it('should validate MONGO_URI format when provided', () => {
      process.env.MONGO_URI = 'invalid-uri';
      
      expect(() => ConfigProvider.validateEnvironment()).toThrow(
        'MONGO_URI must be a valid MongoDB connection string'
      );
    });

    it('should accept valid mongodb:// URI', () => {
      process.env.MONGO_URI = 'mongodb://user:pass@host:27017/db';
      
      expect(() => ConfigProvider.validateEnvironment()).not.toThrow();
    });

    it('should accept valid mongodb+srv:// URI', () => {
      process.env.MONGO_URI = 'mongodb+srv://user:pass@cluster.mongodb.net/db';
      
      expect(() => ConfigProvider.validateEnvironment()).not.toThrow();
    });

    it('should pass validation in production with proper config', () => {
      process.env.NODE_ENV = 'production';
      process.env.COOKIE_SECRET = 'a-very-long-secret-key-that-meets-requirements';
      process.env.MONGO_URI = 'mongodb://localhost:27017/production-db';
      
      expect(() => ConfigProvider.validateEnvironment()).not.toThrow();
    });
  });
});