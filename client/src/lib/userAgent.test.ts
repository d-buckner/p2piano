import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isIOS } from './userAgent';


describe('userAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isIOS', () => {
    it('should return true for iPad user agent', () => {
      mockUserAgent(
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      );

      expect(isIOS()).toBe(true);
    });

    it('should return true for iPhone user agent', () => {
      mockUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      );

      expect(isIOS()).toBe(true);
    });

    it('should return false for Android user agent', () => {
      mockUserAgent(
        'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36'
      );

      expect(isIOS()).toBe(false);
    });

    it('should return false for desktop user agent', () => {
      mockUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      );

      expect(isIOS()).toBe(false);
    });
  });

  function mockUserAgent(userAgent: string) {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);  
  }
});
