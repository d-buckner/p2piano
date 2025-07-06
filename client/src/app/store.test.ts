import { describe, it, expect } from 'vitest';
import { store, setStore, useStore } from './store';

describe('store', () => {
  describe('initial state', () => {
    it('should have correct initial workspace state', () => {
      expect(store.workspace).toEqual({
        roomId: undefined,
        userId: undefined,
        isValid: undefined,
        isLoading: undefined,
        room: undefined,
      });
    });

    it('should have empty initial notes state', () => {
      expect(store.notesByMidi).toEqual({});
    });

    it('should have correct initial connection state', () => {
      expect(store.connection).toEqual({
        maxLatency: 0,
        peerConnections: {},
      });
    });
  });

  describe('useStore', () => {
    it('should return store and setState', () => {
      const result = useStore();
      
      expect(result.state).toBe(store);
      expect(result.setState).toBe(setStore);
    });

    it('should allow updating workspace state', () => {
      const { setState } = useStore();
      
      setState('workspace', 'roomId', 'test-room');
      
      expect(store.workspace.roomId).toBe('test-room');
    });
  });
});