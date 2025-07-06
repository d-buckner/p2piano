import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isIOS } from './userAgent';


describe('userAgent', () => {
  let mockNavigator: Partial<Navigator>;

  beforeEach(() => {
    mockNavigator = {};
    vi.stubGlobal('navigator', mockNavigator);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isIOS', () => {
    it('should return truthy value for iPad user agent', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15';

      const result = isIOS();

      expect(result).toBeTruthy();
    });

    it('should return truthy value for iPhone user agent', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15';

      const result = isIOS();

      expect(result).toBeTruthy();
    });

    it('should return null for non-iOS user agent', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

      const result = isIOS();

      expect(result).toBeNull();
    });

    it('should return null for Android user agent', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 11; SM-G973F) AppleWebKit/537.36';

      const result = isIOS();

      expect(result).toBeNull();
    });

    it('should be case insensitive', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (IPAD; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15';

      const result = isIOS();

      expect(result).toBeTruthy();
    });
  });
});
