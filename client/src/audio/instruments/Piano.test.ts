import { Piano as DPiano } from 'd-piano';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DEFAULT_VELOCITY } from '../../constants';
import getDelayTime from './getDelayTime';
import Piano from './Piano';


type MockDPiano = {
  load: vi.Mock<[], Promise<void>>;
  keyDown: vi.Mock<[unknown], void>;
  keyUp: vi.Mock<[unknown], void>;
  pedalDown: vi.Mock<[], void>;
  pedalUp: vi.Mock<[], void>;
  stopAll: vi.Mock<[], void>;
  dispose: vi.Mock<[], void>;
  toDestination: vi.Mock<[], unknown>;
};

// Mock all dependencies
vi.mock('d-piano');
vi.mock('./getDelayTime');

describe('Piano', () => {
  let mockDPiano: MockDPiano;
  let piano: Piano;
  let mockRequestIdleCallback: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { requestIdleCallback } = await vi.importMock('../../lib/ponyfill');
    mockRequestIdleCallback = vi.mocked(requestIdleCallback);
    
    // Mock setTimeout for disposal timing tests
    vi.spyOn(global, 'setTimeout').mockImplementation(() => {
      // Return a mock timer ID
      return 123 as NodeJS.Timeout;
    });
    
    // Mock DPiano instance
    mockDPiano = {
      load: vi.fn().mockResolvedValue(undefined),
      keyDown: vi.fn(),
      keyUp: vi.fn(),
      pedalDown: vi.fn(),
      pedalUp: vi.fn(),
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
    vi.unstubAllGlobals();
  });

  describe('constructor and initialization', () => {
    it('should initialize and start loading samples', () => {
      piano = new Piano();
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
      // @ts-expect-error - accessing private property for testing
      piano.onIdle = mockOnIdle;
      
      piano.keyUp(60);
      expect(mockOnIdle).not.toHaveBeenCalled(); // 64 still active
    });

    it('should handle multiple presses of same key', () => {
      piano.keyDown(60, undefined, 80);
      piano.keyDown(60, undefined, 100);
      piano.keyDown(60, undefined, 60);

      expect(mockDPiano.keyDown).toHaveBeenCalledTimes(3);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    it('should call keyUp on instrument with correct parameters', () => {
      piano.keyDown(60);
      piano.keyUp(60);
      
      expect(mockDPiano.keyUp).toHaveBeenCalledWith({
        note: '60',
        time: 0,
      });
    });

    it('should call onIdle when all keys are released', () => {
      const mockOnIdle = vi.fn();
      // @ts-expect-error - accessing private property for testing
      piano.onIdle = mockOnIdle;
      
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (piano as any).instrument = undefined;

      expect(() => piano.releaseAll()).not.toThrow();
    });
  });

  describe('sustainDown', () => {
    beforeEach(async () => {
      piano = new Piano();
      await mockDPiano.load();
    });

    it('should call pedalDown on instrument', () => {
      piano.sustainDown();

      expect(mockDPiano.pedalDown).toHaveBeenCalled();
    });

    it('should handle when instrument is not loaded', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (piano as any).instrument = undefined;

      expect(() => piano.sustainDown()).not.toThrow();
    });

    it('should handle multiple sustain down calls', () => {
      piano.sustainDown();
      piano.sustainDown();
      piano.sustainDown();

      expect(mockDPiano.pedalDown).toHaveBeenCalledTimes(3);
    });
  });

  describe('sustainUp', () => {
    beforeEach(async () => {
      piano = new Piano();
      await mockDPiano.load();
    });

    it('should call pedalUp on instrument', () => {
      piano.sustainUp();

      expect(mockDPiano.pedalUp).toHaveBeenCalled();
    });

    it('should handle when instrument is not loaded', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (piano as any).instrument = undefined;

      expect(() => piano.sustainUp()).not.toThrow();
    });

    it('should handle multiple sustain up calls', () => {
      piano.sustainUp();
      piano.sustainUp();

      expect(mockDPiano.pedalUp).toHaveBeenCalledTimes(2);
    });
  });

  describe('sustain pedal integration', () => {
    beforeEach(async () => {
      piano = new Piano();
      await mockDPiano.load();
    });

    it('should handle complete sustain cycle with notes', () => {
      piano.sustainDown();
      piano.keyDown(60, undefined, 100);
      piano.keyUp(60);
      piano.sustainUp();

      expect(mockDPiano.pedalDown).toHaveBeenCalled();
      expect(mockDPiano.keyDown).toHaveBeenCalledWith({
        note: '60',
        time: 0,
        velocity: 100 / 127,
      });
      expect(mockDPiano.keyUp).toHaveBeenCalledWith({
        note: '60',
        time: 0,
      });
      expect(mockDPiano.pedalUp).toHaveBeenCalled();
    });

    it('should handle sustain without notes', () => {
      piano.sustainDown();
      piano.sustainUp();

      expect(mockDPiano.pedalDown).toHaveBeenCalled();
      expect(mockDPiano.pedalUp).toHaveBeenCalled();
      expect(mockDPiano.keyDown).not.toHaveBeenCalled();
      expect(mockDPiano.keyUp).not.toHaveBeenCalled();
    });
  });

  describe('sustain ringing behavior', () => {
    beforeEach(async () => {
      piano = new Piano();
      await mockDPiano.load();
      vi.clearAllMocks(); // Clear initial load calls
    });

    it('should delay instrument disposal when keys are sustained (ringing)', async () => {
      // Press key during sustain to make it ring
      piano.sustainDown();
      piano.keyDown(60);
      piano.keyUp(60); // Key is now ringing

      // Create new instrument to trigger progressive loading
      const secondInstrument = {
        ...mockDPiano,
        load: vi.fn().mockResolvedValue(undefined),
        toDestination: vi.fn().mockReturnThis(),
        dispose: vi.fn(),
      };
      vi.mocked(DPiano).mockImplementation(() => secondInstrument);

      // Trigger progressive loading - should be delayed because keys are ringing
      await piano.load();

      // New instrument should NOT be swapped yet (no toDestination call)
      expect(secondInstrument.toDestination).not.toHaveBeenCalled();
      
      // Old instrument should NOT be disposed yet
      expect(mockDPiano.dispose).not.toHaveBeenCalled();

      // When sustain is released, swap should happen
      piano.sustainUp();
      expect(secondInstrument.toDestination).toHaveBeenCalled();
      
      // Old instrument disposal should be scheduled
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it('should immediately dispose instrument when keys pressed before sustain are released', async () => {
      // Press key BEFORE sustain (this key will NOT ring)
      piano.keyDown(60);
      piano.sustainDown();
      piano.keyUp(60); // This key should not be sustained

      // Create new instrument to trigger progressive loading
      const secondInstrument = {
        ...mockDPiano,
        load: vi.fn().mockResolvedValue(undefined),
        toDestination: vi.fn().mockReturnThis(),
        dispose: vi.fn(),
      };
      vi.mocked(DPiano).mockImplementation(() => secondInstrument);

      // Trigger progressive loading - should happen immediately since no keys are ringing
      await piano.load();

      // New instrument should be swapped immediately
      expect(secondInstrument.toDestination).toHaveBeenCalled();
      
      // Old instrument disposal should be scheduled immediately
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it('should correctly distinguish between sustained and non-sustained keys via disposal timing', async () => {
      // Press key before sustain
      piano.keyDown(60);
      piano.sustainDown();
      // Press key during sustain  
      piano.keyDown(64);

      // Create new instrument
      const secondInstrument = {
        ...mockDPiano,
        load: vi.fn().mockResolvedValue(undefined),
        toDestination: vi.fn().mockReturnThis(),
        dispose: vi.fn(),
      };
      vi.mocked(DPiano).mockImplementation(() => secondInstrument);

      // Release pre-sustain key - piano should still be considered active due to key 64
      piano.keyUp(60);
      await piano.load();
      expect(secondInstrument.toDestination).not.toHaveBeenCalled(); // Still delayed

      // Release sustained key - piano should still be considered active due to ringing
      piano.keyUp(64);
      expect(secondInstrument.toDestination).not.toHaveBeenCalled(); // Still delayed

      // Release sustain - now piano should be idle and swap should happen
      piano.sustainUp();
      expect(secondInstrument.toDestination).toHaveBeenCalled();
    });

    it('should handle multiple sustained keys ringing together via disposal timing', async () => {
      piano.sustainDown();
      piano.keyDown(60);
      piano.keyDown(64);
      piano.keyDown(67); // C major chord
      
      // Release all keys - they should all still be ringing
      piano.keyUp(60);
      piano.keyUp(64);
      piano.keyUp(67);

      // Create new instrument
      const secondInstrument = {
        ...mockDPiano,
        load: vi.fn().mockResolvedValue(undefined),
        toDestination: vi.fn().mockReturnThis(),
        dispose: vi.fn(),
      };
      vi.mocked(DPiano).mockImplementation(() => secondInstrument);

      // Should not swap because all keys are still ringing
      await piano.load();
      expect(secondInstrument.toDestination).not.toHaveBeenCalled();

      // Only when sustain is released should swap trigger
      piano.sustainUp();
      expect(secondInstrument.toDestination).toHaveBeenCalled();
    });
  });


  describe('progressive loading with sustain timing', () => {
    beforeEach(async () => {
      piano = new Piano();
      await mockDPiano.load();
      vi.clearAllMocks(); // Clear initial load calls
    });

    it('should sequence instrument swaps correctly when sustain controls timing', async () => {
      // Test the complete progressive loading sequence with sustain timing control
      piano.sustainDown();
      piano.keyDown(60);
      piano.keyUp(60); // Key is ringing
      
      // First progressive load attempt - should be delayed
      const secondInstrument = {
        ...mockDPiano,
        load: vi.fn().mockResolvedValue(undefined),
        toDestination: vi.fn().mockReturnThis(),
        dispose: vi.fn(),
      };
      vi.mocked(DPiano).mockImplementation(() => secondInstrument);
      
      await piano.load();
      expect(secondInstrument.toDestination).not.toHaveBeenCalled();
      
      // Release sustain - swap should happen and schedule disposal
      piano.sustainUp();
      expect(secondInstrument.toDestination).toHaveBeenCalled();
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it('should handle rapid sustain toggling during progressive loading', async () => {
      // Reset velocity index to test multiple loading cycles
      // @ts-expect-error - accessing private property for testing setup
      piano.velocityIndex = 0;
      
      const secondInstrument = {
        ...mockDPiano,
        load: vi.fn().mockResolvedValue(undefined),
        toDestination: vi.fn().mockReturnThis(),
        dispose: vi.fn(),
      };
      vi.mocked(DPiano).mockImplementation(() => secondInstrument);

      // First cycle - sustain prevents immediate swap
      piano.sustainDown();
      piano.keyDown(60);
      piano.keyUp(60);
      await piano.load();
      expect(secondInstrument.toDestination).not.toHaveBeenCalled();

      // Release sustain - first swap happens
      piano.sustainUp();
      expect(secondInstrument.toDestination).toHaveBeenCalled();
      
      // Verify disposal scheduling for the swap
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it('should handle mixed active keys and sustained keys during loading', async () => {
      // Press key before sustain
      piano.keyDown(60);
      piano.sustainDown();
      // Press key during sustain  
      piano.keyDown(64);

      const secondInstrument = {
        ...mockDPiano,
        load: vi.fn().mockResolvedValue(undefined),
        toDestination: vi.fn().mockReturnThis(),
        dispose: vi.fn(),
      };
      vi.mocked(DPiano).mockImplementation(() => secondInstrument);

      // Should be delayed due to active key 64
      await piano.load();
      expect(secondInstrument.toDestination).not.toHaveBeenCalled();

      // Release pre-sustain key - should still be delayed due to active key 64
      piano.keyUp(60);
      expect(secondInstrument.toDestination).not.toHaveBeenCalled();

      // Release sustained key - should still be delayed due to ringing
      piano.keyUp(64);
      expect(secondInstrument.toDestination).not.toHaveBeenCalled();

      // Release sustain - now swap should happen
      piano.sustainUp();
      expect(secondInstrument.toDestination).toHaveBeenCalled();
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it('should clear all sustained keys and allow immediate swapping after sustain release', async () => {
      // Reset velocity index to ensure we can load again
      // @ts-expect-error - accessing private property for testing setup
      piano.velocityIndex = 0;
      
      // Create multiple sustained keys
      piano.sustainDown();
      piano.keyDown(60);
      piano.keyDown(64);
      piano.keyDown(67);
      piano.keyUp(60);
      piano.keyUp(64);
      piano.keyUp(67);

      const secondInstrument = {
        ...mockDPiano,
        load: vi.fn().mockResolvedValue(undefined),
        toDestination: vi.fn().mockReturnThis(),
        dispose: vi.fn(),
      };
      vi.mocked(DPiano).mockImplementation(() => secondInstrument);

      // Should be delayed due to all keys ringing
      await piano.load();
      expect(secondInstrument.toDestination).not.toHaveBeenCalled();

      // Release sustain should clear all sustained keys and allow swap
      piano.sustainUp();
      expect(secondInstrument.toDestination).toHaveBeenCalled();
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });
  });

  describe('progressive sample loading', () => {
    it('should initialize with first velocity layer', () => {
      piano = new Piano();

      expect(DPiano).toHaveBeenCalledWith(
        expect.objectContaining({
          velocities: 1, // First velocity layer
        })
      );
      expect(mockDPiano.load).toHaveBeenCalled();
    });

    it('should use requestIdleCallback for progressive loading', async () => {
      piano = new Piano();
      await mockDPiano.load();

      // Should schedule next layer loading via requestIdleCallback
      expect(mockRequestIdleCallback).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

});
