import { describe, it, expect, vi, beforeEach } from 'vitest';
import { selectUser, selectWorkspace } from '../selectors/workspaceSelectors';
import { getResolvedUserId, getUserColor } from './utils';

// Mock dependencies
vi.mock('../selectors/workspaceSelectors', () => ({
  selectUser: vi.fn(),
  selectWorkspace: vi.fn(),
}));

vi.mock('../app/store', () => ({
  store: {},
}));

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getResolvedUserId', () => {
    it('should return provided userId when given', () => {
      const userId = 'provided-user-id';
      
      const result = getResolvedUserId(userId);
      
      expect(result).toBe(userId);
      expect(selectWorkspace).not.toHaveBeenCalled();
    });

    it('should return workspace userId when no userId provided', () => {
      const workspaceUserId = 'workspace-user-id';
      vi.mocked(selectWorkspace).mockReturnValue({ userId: workspaceUserId });
      
      const result = getResolvedUserId();
      
      expect(result).toBe(workspaceUserId);
      expect(selectWorkspace).toHaveBeenCalled();
    });

    it('should return workspace userId when undefined userId provided', () => {
      const workspaceUserId = 'workspace-user-id';
      vi.mocked(selectWorkspace).mockReturnValue({ userId: workspaceUserId });
      
      const result = getResolvedUserId(undefined);
      
      expect(result).toBe(workspaceUserId);
      expect(selectWorkspace).toHaveBeenCalled();
    });

    it('should return undefined when no userId and no workspace userId', () => {
      vi.mocked(selectWorkspace).mockReturnValue({ userId: undefined });
      
      const result = getResolvedUserId();
      
      expect(result).toBeUndefined();
      expect(selectWorkspace).toHaveBeenCalled();
    });

    it('should prefer provided userId over workspace userId', () => {
      const providedUserId = 'provided-user-id';
      const workspaceUserId = 'workspace-user-id';
      vi.mocked(selectWorkspace).mockReturnValue({ userId: workspaceUserId });
      
      const result = getResolvedUserId(providedUserId);
      
      expect(result).toBe(providedUserId);
      expect(selectWorkspace).not.toHaveBeenCalled();
    });

    it('should handle empty string as falsy and use workspace userId', () => {
      const emptyString = '';
      const workspaceUserId = 'workspace-user-id';
      vi.mocked(selectWorkspace).mockReturnValue({ userId: workspaceUserId });
      
      const result = getResolvedUserId(emptyString);
      
      expect(result).toBe(workspaceUserId);
      expect(selectWorkspace).toHaveBeenCalled();
    });
  });

  describe('getUserColor', () => {
    it('should return user color when user exists', () => {
      const userId = 'user-123';
      const userColor = '#ff0000';
      const mockUser = { color: userColor };
      
      vi.mocked(selectUser).mockReturnValue(() => mockUser);
      
      const result = getUserColor(userId);
      
      expect(result).toBe(userColor);
      expect(selectUser).toHaveBeenCalledWith(userId);
    });

    it('should return undefined when user does not exist', () => {
      const userId = 'nonexistent-user';
      
      vi.mocked(selectUser).mockReturnValue(() => undefined);
      
      const result = getUserColor(userId);
      
      expect(result).toBeUndefined();
      expect(selectUser).toHaveBeenCalledWith(userId);
    });

    it('should return undefined when user exists but has no color', () => {
      const userId = 'user-without-color';
      const mockUser = { color: undefined };
      
      vi.mocked(selectUser).mockReturnValue(() => mockUser);
      
      const result = getUserColor(userId);
      
      expect(result).toBeUndefined();
      expect(selectUser).toHaveBeenCalledWith(userId);
    });

    it('should handle different user IDs', () => {
      const testCases = [
        { userId: 'user-1', color: '#ff0000' },
        { userId: 'user-2', color: '#00ff00' },
        { userId: 'user-3', color: '#0000ff' },
      ];

      testCases.forEach(({ userId, color }) => {
        vi.mocked(selectUser).mockReturnValue(() => ({ color }));
        
        const result = getUserColor(userId);
        
        expect(result).toBe(color);
        expect(selectUser).toHaveBeenCalledWith(userId);
      });
    });

    it('should return null when user selector returns null', () => {
      const userId = 'user-123';
      
      vi.mocked(selectUser).mockReturnValue(() => null);
      
      const result = getUserColor(userId);
      
      expect(result).toBeUndefined();
      expect(selectUser).toHaveBeenCalledWith(userId);
    });

    it('should handle empty string userId', () => {
      const userId = '';
      const userColor = '#ff0000';
      
      vi.mocked(selectUser).mockReturnValue(() => ({ color: userColor }));
      
      const result = getUserColor(userId);
      
      expect(result).toBe(userColor);
      expect(selectUser).toHaveBeenCalledWith(userId);
    });
  });
});
