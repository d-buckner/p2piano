import { describe, it, expect, vi } from 'vitest';
import { getNextColor } from './ColorUtils';

describe('ColorUtils', () => {
  describe('getNextColor', () => {
    it('should return middle color when all colors are available', () => {
      const result = getNextColor([]);
      expect(result).toBe('#5dadec'); // Middle color from available colors
    });

    it('should return middle color from remaining colors when some are used', () => {
      const usedColors = ['#4fb477ff', '#ff7a00'];
      const result = getNextColor(usedColors);
      
      // Available colors: ['#5dadec', '#c287e8ff', '#f0b67fff']
      // Middle index is 1, so should return '#c287e8ff'
      expect(result).toBe('#c287e8ff');
    });

    it('should return random color when all colors are used', () => {
      const allColors = ['#4fb477ff', '#ff7a00', '#5dadec', '#c287e8ff', '#f0b67fff'];
      
      // Mock Math.random to return a predictable value
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const result = getNextColor(allColors);
      
      // With Math.random() = 0.5, Math.floor(0.5 * 5) = 2
      // So should return colors[2] = '#5dadec'
      expect(result).toBe('#5dadec');
    });

    it('should handle empty used colors array', () => {
      const result = getNextColor([]);
      expect(typeof result).toBe('string');
      expect(result.startsWith('#')).toBe(true);
    });
  });
});