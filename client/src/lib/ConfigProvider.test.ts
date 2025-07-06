import { describe, it, expect, beforeEach } from 'vitest';
import ConfigProvider from './ConfigProvider';


describe('ConfigProvider', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.API_URL;
  });

  describe('getServiceUrl', () => {
    it('should return API_URL from environment', () => {
      process.env.API_URL = 'http://localhost:3001/api';
      
      const result = ConfigProvider.getServiceUrl();
      
      expect(result).toBe('http://localhost:3001/api');
    });

    it('should return production API URL', () => {
      process.env.API_URL = '/api';
      
      const result = ConfigProvider.getServiceUrl();
      
      expect(result).toBe('/api');
    });

    it('should handle different API URLs', () => {
      process.env.API_URL = 'https://api.example.com';
      
      const result = ConfigProvider.getServiceUrl();
      
      expect(result).toBe('https://api.example.com');
    });
  });
});
