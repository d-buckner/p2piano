import { createMemo } from 'solid-js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppSelector, useAppDispatch } from './hooks';

// Mock dependencies
vi.mock('solid-js', () => ({
  createMemo: vi.fn((fn) => fn),
}));

const mockState = {
  notes: { activeNotes: [] },
  workspace: { roomId: 'test-room' },
  connection: { isConnected: true },
};

const mockSetState = vi.fn();

vi.mock('./store', () => ({
  useStore: vi.fn(() => ({
    state: mockState,
    setState: mockSetState,
  })),
}));

describe('hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAppSelector', () => {
    it('should create a memo with the selector function', () => {
      const selector = (state: any) => state.workspace.roomId;
      const result = useAppSelector(selector);
      
      expect(createMemo).toHaveBeenCalledWith(expect.any(Function));
      expect(result()).toBe('test-room');
    });

    it('should return selected state value', () => {
      const selector = (state: any) => state.connection.isConnected;
      const result = useAppSelector(selector);
      
      expect(result()).toBe(true);
    });

    it('should handle complex selectors', () => {
      const selector = (state: any) => ({
        roomId: state.workspace.roomId,
        isConnected: state.connection.isConnected,
      });
      const result = useAppSelector(selector);
      
      expect(result()).toEqual({
        roomId: 'test-room',
        isConnected: true,
      });
    });
  });

  describe('useAppDispatch', () => {
    it('should return a dispatch function', () => {
      const dispatch = useAppDispatch();
      
      expect(typeof dispatch).toBe('function');
    });

    it('should call setState when dispatch is invoked', () => {
      const dispatch = useAppDispatch();
      dispatch();
      
      expect(mockSetState).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should return previous state when dispatch is called', () => {
      const dispatch = useAppDispatch();
      dispatch();
      
      const setStateCallback = mockSetState.mock.calls[0][0];
      const prevState = { test: 'state' };
      const result = setStateCallback(prevState);
      
      expect(result).toBe(prevState);
    });
  });
});
