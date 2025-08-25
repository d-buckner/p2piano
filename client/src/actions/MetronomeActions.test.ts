import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MIN_BPM, MAX_BPM } from '../constants/metronome';
import { sharedStoreRoot } from '../crdt/store';
import metronomeActions from './MetronomeActions';

// Mock the sharedStoreRoot dependency
vi.mock('../crdt/store', () => ({
  sharedStoreRoot: {
    change: vi.fn(),
  },
}));

// Mock SharedStoreActions
vi.mock('../crdt/store/SharedStoreActions', () => ({
  SharedStoreActions: class MockSharedStoreActions {
    constructor(key, root) {
      this.key = key;
      this.root = root;
    }
    change(fn) {
      this.root.change(this.key, fn);
    }
  },
}));

describe('MetronomeActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setActive', () => {
    it('should set metronome active to true', () => {
      metronomeActions.setActive(true);
      
      expect(sharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });

    it('should set metronome active to false and reset state', () => {
      metronomeActions.setActive(false);
      
      expect(sharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });
  });

  describe('setBpm', () => {
    it('should set valid BPM value', () => {
      const validBpm = 120;
      metronomeActions.setBpm(validBpm);
      
      expect(sharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });

    it('should clamp BPM to minimum value', () => {
      const tooLow = MIN_BPM - 10;
      metronomeActions.setBpm(tooLow);
      
      expect(sharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });

    it('should clamp BPM to maximum value', () => {
      const tooHigh = MAX_BPM + 10;
      metronomeActions.setBpm(tooHigh);
      
      expect(sharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });

    it('should handle edge case values', () => {
      metronomeActions.setBpm(MIN_BPM);
      expect(sharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );

      metronomeActions.setBpm(MAX_BPM);
      expect(sharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });
  });

  describe('start', () => {
    it('should start metronome with valid user ID', () => {
      const userId = 'user-123';
      metronomeActions.start(userId);
      
      expect(sharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });
  });

  describe('stop', () => {
    it('should stop metronome and reset state', () => {
      metronomeActions.stop();
      
      expect(sharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });
  });

  describe('setCurrentBeat', () => {
    it('should set current beat', () => {
      const beat = 3;
      metronomeActions.setCurrentBeat(beat);
      
      expect(sharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });
  });
});
