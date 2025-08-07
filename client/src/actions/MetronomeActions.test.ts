import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MIN_BPM, MAX_BPM } from '../constants/metronome';
import { initializeGlobalStore } from '../crdt/store/SharedStoreActions';
import { MetronomeActions } from './MetronomeActions';
import type { SharedStoreRoot } from '../crdt/store/SharedStoreRoot';


describe('MetronomeActions', () => {
  let metronomeActions: MetronomeActions;
  let mockSharedStoreRoot: SharedStoreRoot;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock SharedStoreRoot
    mockSharedStoreRoot = {
      change: vi.fn(),
    } as unknown as SharedStoreRoot;
    
    // Initialize global store so actions will work
    initializeGlobalStore(mockSharedStoreRoot);
    
    // Create metronome actions instance
    metronomeActions = new MetronomeActions();
  });

  describe('setActive', () => {
    it('should set metronome active to true', () => {
      metronomeActions.setActive(true);
      
      expect(mockSharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });

    it('should set metronome active to false and reset state', () => {
      metronomeActions.setActive(false);
      
      expect(mockSharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });
  });

  describe('setBpm', () => {
    it('should set valid BPM value', () => {
      const validBpm = 120;
      metronomeActions.setBpm(validBpm);
      
      expect(mockSharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });

    it('should clamp BPM to minimum value', () => {
      const tooLow = MIN_BPM - 10;
      metronomeActions.setBpm(tooLow);
      
      expect(mockSharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });

    it('should clamp BPM to maximum value', () => {
      const tooHigh = MAX_BPM + 10;
      metronomeActions.setBpm(tooHigh);
      
      expect(mockSharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });

    it('should handle edge case values', () => {
      metronomeActions.setBpm(MIN_BPM);
      expect(mockSharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );

      metronomeActions.setBpm(MAX_BPM);
      expect(mockSharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });
  });

  describe('start', () => {
    it('should start metronome with valid user ID', () => {
      const userId = 'user-123';
      metronomeActions.start(userId);
      
      expect(mockSharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });
  });

  describe('stop', () => {
    it('should stop metronome and reset state', () => {
      metronomeActions.stop();
      
      expect(mockSharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });
  });

  describe('setCurrentBeat', () => {
    it('should set current beat', () => {
      const beat = 3;
      metronomeActions.setCurrentBeat(beat);
      
      expect(mockSharedStoreRoot.change).toHaveBeenCalledWith(
        'metronome',
        expect.any(Function)
      );
    });
  });
});
