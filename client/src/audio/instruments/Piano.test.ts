import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Piano from './Piano';
import { Piano as DPiano } from 'd-piano';
import { DEFAULT_VELOCITY } from '../../constants';
import getDelayTime from './getDelayTime';

// Mock all dependencies
vi.mock('d-piano');
vi.mock('./getDelayTime');

// Mock requestIdleCallback
const mockRequestIdleCallback = vi.fn();
global.requestIdleCallback = mockRequestIdleCallback;

describe('Piano', () => {
  let mockDPiano: any;
  let piano: Piano;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock DPiano instance
    mockDPiano = {
      load: vi.fn().mockResolvedValue(undefined),
      keyDown: vi.fn(),
      keyUp: vi.fn(),
      stopAll: vi.fn(),
      dispose: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
    };
    
    vi.mocked(DPiano).mockImplementation(() => mockDPiano);
    vi.mocked(getDelayTime).mockReturnValue(0);
    
    // Mock Date.now for consistent timing tests
    vi.spyOn(Date, 'now').mockReturnValue(1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor and initialization', () => {
    it('should initialize and start loading samples', () => {
      piano = new Piano();

      expect(DPiano).toHaveBeenCalledWith({
        url: '/assets/samples/piano/',
        velocities: 2, // First velocity layer
      });
      expect(mockDPiano.load).toHaveBeenCalled();
    });
  });

  describe('keyDown', () => {
    beforeEach(async () => {
      piano = new Piano();
      // Complete initial load
      await mockDPiano.load();
    });

    it('should call instrument keyDown with correct parameters', () => {
      piano.keyDown(60, 100, 90);

      expect(mockDPiano.keyDown).toHaveBeenCalledWith({
        note: '60',
        time: 0, // mocked getDelayTime return
        velocity: 90 / 127,
      });
    });

    it('should use default velocity when not provided', () => {
      piano.keyDown(60, 50);

      expect(mockDPiano.keyDown).toHaveBeenCalledWith({
        note: '60',
        time: 0,
        velocity: DEFAULT_VELOCITY / 127,
      });
    });

    it('should handle delay time correctly', () => {
      vi.mocked(getDelayTime).mockReturnValue(0.1);
      
      piano.keyDown(60, 100, 80);

      expect(getDelayTime).toHaveBeenCalledWith(100);
      expect(mockDPiano.keyDown).toHaveBeenCalledWith({
        note: '60',
        time: 0.1,
        velocity: 80 / 127,
      });
    });

    it('should add key to active keys set', () => {
      piano.keyDown(60);
      piano.keyDown(64);

      // Verify by checking that keyUp doesn't trigger onIdle when keys are still active
      const mockOnIdle = vi.fn();
      (piano as any).onIdle = mockOnIdle;
      
      piano.keyUp(60);
      expect(mockOnIdle).not.toHaveBeenCalled(); // 64 still active
    });

    it('should handle multiple presses of same key', () => {
      piano.keyDown(60, undefined, 80);
      piano.keyDown(60, undefined, 100);
      piano.keyDown(60, undefined, 60);

      expect(mockDPiano.keyDown).toHaveBeenCalledTimes(3);
      // Active keys should still only contain one entry for MIDI 60
      expect((piano as any).activeKeys.size).toBe(1);
    });

    it('should handle edge case MIDI values', () => {
      piano.keyDown(0, undefined, 127);
      piano.keyDown(127, undefined, 1);

      expect(mockDPiano.keyDown).toHaveBeenNthCalledWith(1, {
        note: '0',
        time: 0,
        velocity: 127 / 127,
      });
      expect(mockDPiano.keyDown).toHaveBeenNthCalledWith(2, {
        note: '127',
        time: 0,
        velocity: 1 / 127,
      });
    });

    it('should handle when instrument is not loaded yet', () => {
      const uninitializedPiano = new Piano();
      (uninitializedPiano as any).instrument = undefined;

      // Should not throw even if instrument is not ready
      expect(() => uninitializedPiano.keyDown(60)).not.toThrow();
    });
  });

  describe('keyUp', () => {
    beforeEach(async () => {
      piano = new Piano();
      await mockDPiano.load();
    });

    it('should call instrument keyUp with correct parameters', () => {
      piano.keyUp(60, 100);

      expect(mockDPiano.keyUp).toHaveBeenCalledWith({
        note: '60',
        time: 0,
      });
    });

    it('should remove key from active keys set', () => {
      piano.keyDown(60);
      piano.keyDown(64);
      
      piano.keyUp(60);
      
      expect((piano as any).activeKeys.has(60)).toBe(false);
      expect((piano as any).activeKeys.has(64)).toBe(true);
    });

    it('should call onIdle when all keys are released', () => {
      const mockOnIdle = vi.fn();
      (piano as any).onIdle = mockOnIdle;
      
      piano.keyDown(60);
      piano.keyDown(64);
      
      piano.keyUp(60);
      expect(mockOnIdle).not.toHaveBeenCalled();
      
      piano.keyUp(64);
      expect(mockOnIdle).toHaveBeenCalled();
    });

    it('should not call onIdle if no callback is set', () => {
      piano.keyDown(60);
      
      // Should not throw when onIdle is null
      expect(() => piano.keyUp(60)).not.toThrow();
    });

    it('should handle releasing keys that were not pressed', () => {
      // Should not throw or cause issues
      expect(() => piano.keyUp(60)).not.toThrow();
      expect(mockDPiano.keyUp).toHaveBeenCalledWith({
        note: '60',
        time: 0,
      });
    });

    it('should handle delay time correctly', () => {
      vi.mocked(getDelayTime).mockReturnValue(0.05);
      
      piano.keyUp(60, 75);

      expect(getDelayTime).toHaveBeenCalledWith(75);
      expect(mockDPiano.keyUp).toHaveBeenCalledWith({
        note: '60',
        time: 0.05,
      });
    });
  });

  describe('releaseAll', () => {
    beforeEach(async () => {
      piano = new Piano();
      await mockDPiano.load();
    });

    it('should call stopAll on instrument', () => {
      piano.releaseAll();

      expect(mockDPiano.stopAll).toHaveBeenCalled();
    });

    it('should handle when instrument is not loaded', () => {
      (piano as any).instrument = undefined;

      expect(() => piano.releaseAll()).not.toThrow();
    });
  });

  describe('progressive sample loading', () => {
    it('should initialize with first velocity layer', () => {
      piano = new Piano();

      expect(DPiano).toHaveBeenCalledWith({
        url: '/assets/samples/piano/',
        velocities: 2, // First velocity layer
      });
      expect(mockDPiano.load).toHaveBeenCalled();
    });

    it('should use requestIdleCallback for progressive loading', async () => {
      piano = new Piano();
      await mockDPiano.load();

      // Should schedule next layer loading via requestIdleCallback
      expect(mockRequestIdleCallback).toHaveBeenCalledWith(
        expect.any(Function),
        { timeout: 5000 }
      );
    });
  });

});