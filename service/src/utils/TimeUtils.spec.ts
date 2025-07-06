import { describe, it, expect, vi } from 'vitest';
import { getTtlInHoursFromNow } from './TimeUtils';

describe('TimeUtils', () => {
  describe('getTtlInHoursFromNow', () => {
    it('should return correct timestamp for 1 hour from now', () => {
      const mockNow = 1000000000; // Mock timestamp in milliseconds
      vi.spyOn(Date, 'now').mockReturnValue(mockNow);
      
      const result = getTtlInHoursFromNow(1);
      const expectedSeconds = Math.floor(mockNow / 1000) + 3600;
      
      expect(result).toBe(expectedSeconds);
    });

    it('should return correct timestamp for 24 hours from now', () => {
      const mockNow = 1500000000;
      vi.spyOn(Date, 'now').mockReturnValue(mockNow);
      
      const result = getTtlInHoursFromNow(24);
      const expectedSeconds = Math.floor(mockNow / 1000) + (24 * 3600);
      
      expect(result).toBe(expectedSeconds);
    });

    it('should handle zero hours', () => {
      const mockNow = 2000000000;
      vi.spyOn(Date, 'now').mockReturnValue(mockNow);
      
      const result = getTtlInHoursFromNow(0);
      const expectedSeconds = Math.floor(mockNow / 1000);
      
      expect(result).toBe(expectedSeconds);
    });
  });
});