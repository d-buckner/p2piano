import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AudioManager from './AudioManager';

// Mock Tone.js
const mockToneStart = vi.fn();
const mockToneContext = vi.fn();
const mockSetContext = vi.fn();
const mockGetDestination = vi.fn();
const mockDestinationVolume = { value: 0 };
const mockDestination = { 
  volume: mockDestinationVolume,
  mute: false 
};

vi.mock('tone', () => ({
  start: mockToneStart,
  Context: mockToneContext,
  setContext: mockSetContext,
  getDestination: mockGetDestination,
}));

describe('AudioManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // @ts-expect-error private property
    AudioManager.state = 'inactive';
    // @ts-expect-error private property
    AudioManager.activeCallbacks = [];
    // @ts-expect-error private property
    AudioManager.tone = null;
    
    mockToneStart.mockResolvedValue(undefined);
    mockToneContext.mockImplementation(() => ({}));
    mockGetDestination.mockReturnValue(mockDestination);
    mockDestinationVolume.value = 0;
    mockDestination.mute = false;
    
    // Mock the imported tone module structure
    const mockToneModule = {
      start: mockToneStart,
      Context: mockToneContext,
      setContext: mockSetContext,
      getDestination: mockGetDestination,
    };
    vi.doMock('tone', () => mockToneModule);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('activate()', () => {
    it('should transition from inactive to active state', async () => {
      expect(AudioManager.active).toBe(false);
      
      await AudioManager.activate();
      
      expect(AudioManager.active).toBe(true);
    });

    it('should initialize Tone.js with correct configuration', async () => {
      await AudioManager.activate();
      
      expect(mockToneContext).toHaveBeenCalledWith({
        latencyHint: 'interactive',
        lookAhead: 0,
      });
      expect(mockSetContext).toHaveBeenCalled();
      expect(mockToneStart).toHaveBeenCalled();
    });

    it('should not activate twice if already active', async () => {
      await AudioManager.activate();
      vi.clearAllMocks();
      
      await AudioManager.activate();
      
      expect(mockToneContext).not.toHaveBeenCalled();
      expect(mockSetContext).not.toHaveBeenCalled();
      expect(mockToneStart).not.toHaveBeenCalled();
    });

    it('should not activate twice if currently starting', async () => {
      const activationPromise = AudioManager.activate();
      
      const secondActivationPromise = AudioManager.activate();
      
      await Promise.all([activationPromise, secondActivationPromise]);
      
      expect(mockToneContext).toHaveBeenCalledTimes(1);
      expect(mockSetContext).toHaveBeenCalledTimes(1);
      expect(mockToneStart).toHaveBeenCalledTimes(1);
    });

    it('should execute pending callbacks when activation completes', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      AudioManager.whenActive(callback1);
      AudioManager.whenActive(callback2);
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      
      await AudioManager.activate();
      
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should clear callbacks array after execution', async () => {
      const callback = vi.fn();
      AudioManager.whenActive(callback);
      
      await AudioManager.activate();
      
      const laterCallback = vi.fn();
      AudioManager.whenActive(laterCallback);
      
      expect(laterCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('active getter', () => {
    it('should return false when inactive', () => {
      expect(AudioManager.active).toBe(false);
    });

    it('should return true when active', async () => {
      await AudioManager.activate();
      expect(AudioManager.active).toBe(true);
    });

  });

  describe('whenActive()', () => {
    it('should execute callback immediately if already active', async () => {
      await AudioManager.activate();
      const callback = vi.fn();
      
      AudioManager.whenActive(callback);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should queue callback if not active', () => {
      const callback = vi.fn();
      
      AudioManager.whenActive(callback);
      
      expect(callback).not.toHaveBeenCalled();
    });


    it('should preserve callback execution order', async () => {
      const executionOrder: number[] = [];
      const callback1 = () => executionOrder.push(1);
      const callback2 = () => executionOrder.push(2);
      const callback3 = () => executionOrder.push(3);
      
      AudioManager.whenActive(callback1);
      AudioManager.whenActive(callback2);
      AudioManager.whenActive(callback3);
      
      await AudioManager.activate();
      
      expect(executionOrder).toEqual([1, 2, 3]);
    });
  });

  describe('error handling', () => {
    it('should handle Tone.js initialization failure', async () => {
      const error = new Error('Tone.js failed to initialize');
      mockToneStart.mockRejectedValue(error);
      
      await expect(AudioManager.activate()).rejects.toThrow('Tone.js failed to initialize');
      
      expect(AudioManager.active).toBe(false);
    });

    it('should handle callback execution errors gracefully', async () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Callback failed');
      });
      const successCallback = vi.fn();
      
      AudioManager.whenActive(errorCallback);
      AudioManager.whenActive(successCallback);
      
      // The current implementation doesn't handle callback errors gracefully,
      // so this test documents the current behavior rather than ideal behavior
      await expect(AudioManager.activate()).rejects.toThrow('Callback failed');
      
      expect(errorCallback).toHaveBeenCalled();
    });
  });

  describe('singleton behavior', () => {
    it('should maintain state across multiple references', async () => {
      const manager1 = AudioManager;
      const manager2 = AudioManager;
      
      expect(manager1.active).toBe(false);
      expect(manager2.active).toBe(false);
      
      await manager1.activate();
      
      expect(manager1.active).toBe(true);
      expect(manager2.active).toBe(true);
    });
  });

  describe('volume control', () => {
    beforeEach(async () => {
      // Mock the Tone module for the activate call
      // @ts-expect-error private property
      AudioManager.tone = {
        start: mockToneStart,
        Context: mockToneContext,
        setContext: mockSetContext,
        getDestination: mockGetDestination,
      };
      // @ts-expect-error private property
      AudioManager.state = 'active';
    });

    describe('setVolume()', () => {
      it('should convert 0-1 range to logarithmic dB values', () => {
        AudioManager.setVolume(0);
        expect(mockDestinationVolume.value).toBe(-60);

        AudioManager.setVolume(1);
        expect(mockDestinationVolume.value).toBe(0);

        AudioManager.setVolume(0.5);
        expect(mockDestinationVolume.value).toBeCloseTo(-6.02, 1);
      });

      it('should not call setVolume when inactive', () => {
        // @ts-expect-error private property
        AudioManager.state = 'inactive';
        
        AudioManager.setVolume(0.5);
        
        expect(mockGetDestination).not.toHaveBeenCalled();
      });

      it('should not call setVolume when tone is null', () => {
        // @ts-expect-error private property
        AudioManager.tone = null;
        
        AudioManager.setVolume(0.5);
        
        expect(mockGetDestination).not.toHaveBeenCalled();
      });
    });

    describe('mute()', () => {
      it('should set destination mute to true', () => {
        AudioManager.mute();
        
        expect(mockGetDestination).toHaveBeenCalled();
        expect(mockDestination.mute).toBe(true);
      });

      it('should not call mute when inactive', () => {
        // @ts-expect-error private property
        AudioManager.state = 'inactive';
        
        AudioManager.mute();
        
        expect(mockGetDestination).not.toHaveBeenCalled();
      });
    });

    describe('unmute()', () => {
      it('should set destination mute to false', () => {
        mockDestination.mute = true;
        
        AudioManager.unmute();
        
        expect(mockGetDestination).toHaveBeenCalled();
        expect(mockDestination.mute).toBe(false);
      });

      it('should not call unmute when inactive', () => {
        // @ts-expect-error private property
        AudioManager.state = 'inactive';
        
        AudioManager.unmute();
        
        expect(mockGetDestination).not.toHaveBeenCalled();
      });
    });
  });

  describe('destroy()', () => {
    it('should reset state and clear cached tone', async () => {
      await AudioManager.activate();
      const callback = vi.fn();
      AudioManager.whenActive(callback);
      
      AudioManager.destroy();
      
      expect(AudioManager.active).toBe(false);
      // @ts-expect-error private property
      expect(AudioManager.tone).toBe(null);
      // @ts-expect-error private property
      expect(AudioManager.activeCallbacks).toEqual([]);
    });
  });
});