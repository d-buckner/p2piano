import { describe, it, expect, beforeEach, vi } from 'vitest';
import ClientPreferences from './ClientPreferences';


describe('ClientPreferences', () => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Use vi.stubGlobal for cleaner global mocking
    vi.stubGlobal('localStorage', mockLocalStorage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getDisplayName', () => {
    it('should return display name from localStorage', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('TestUser');
      
      const result = ClientPreferences.getDisplayName();
      
      expect(result).toBe('TestUser');
      expect(localStorage.getItem).toHaveBeenCalledWith('displayName');
    });

    it('should return undefined when no display name exists', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      
      const result = ClientPreferences.getDisplayName();
      
      expect(result).toBeUndefined();
    });
  });

  describe('setDisplayName', () => {
    it('should save display name to localStorage', () => {
      ClientPreferences.setDisplayName('NewUser');
      
      expect(localStorage.setItem).toHaveBeenCalledWith('displayName', 'NewUser');
    });
  });

  describe('hasDisplayName', () => {
    it('should return true when display name exists', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('ExistingUser');
      
      const result = ClientPreferences.hasDisplayName();
      
      expect(result).toBe(true);
    });

    it('should return false when display name does not exist', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      
      const result = ClientPreferences.hasDisplayName();
      
      expect(result).toBe(false);
    });

    it('should return false for empty string display name', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('');
      
      const result = ClientPreferences.hasDisplayName();
      
      expect(result).toBe(false);
    });
  });
});
