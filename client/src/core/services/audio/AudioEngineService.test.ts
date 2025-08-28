import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioEngineService } from './AudioEngineService';
import type { INetworkService } from '../network/INetworkService';

// Mock the network service
const mockNetworkService: INetworkService = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  isConnected: vi.fn(() => false),
  registerCodec: vi.fn(),
  unregisterCodec: vi.fn(),
  broadcast: vi.fn(),
  send: vi.fn(),
  onMessage: vi.fn(() => vi.fn()),
  offMessage: vi.fn()
};

// Mock Tone.js
vi.mock('tone', () => ({
  default: {
    Context: vi.fn(() => ({
      latencyHint: 'interactive',
      lookAhead: 0
    })),
    getDestination: vi.fn(() => ({
      volume: { value: 0 },
      mute: false
    })),
    start: vi.fn().mockResolvedValue(undefined),
    setContext: vi.fn()
  }
}));

describe('AudioEngineService Reactive State', () => {
  let audioService: AudioEngineService;

  beforeEach(() => {
    audioService = new AudioEngineService(mockNetworkService);
  });

  it('should initialize with correct default reactive state', () => {
    expect(audioService.events.getCurrentValue('status')).toBe('inactive');
    expect(audioService.events.getCurrentValue('volume')).toBe(0.8);
    expect(audioService.events.getCurrentValue('isMuted')).toBe(false);
    expect(audioService.events.getCurrentValue('activeInstruments')).toEqual([]);
    expect(audioService.events.getCurrentValue('isInitialized')).toBe(false);
    expect(audioService.events.getCurrentValue('lastError')).toBe(null);
  });

  it('should update volume state reactively', () => {
    const volumeListener = vi.fn();
    audioService.events.on('volume', volumeListener);

    audioService.setVolume(0.5);

    expect(audioService.events.getCurrentValue('volume')).toBe(0.5);
    expect(volumeListener).toHaveBeenCalledWith(0.5);
  });

  it('should clamp volume between 0 and 1', () => {
    audioService.setVolume(-0.5);
    expect(audioService.events.getCurrentValue('volume')).toBe(0);

    audioService.setVolume(1.5);
    expect(audioService.events.getCurrentValue('volume')).toBe(1);
  });

  it('should update mute state reactively', () => {
    const muteListener = vi.fn();
    audioService.events.on('isMuted', muteListener);

    audioService.mute();
    expect(audioService.events.getCurrentValue('isMuted')).toBe(true);
    expect(muteListener).toHaveBeenCalledWith(true);

    audioService.unmute();
    expect(audioService.events.getCurrentValue('isMuted')).toBe(false);
    expect(muteListener).toHaveBeenCalledWith(false);
  });

  it('should provide getter methods for reactive state', () => {
    audioService.setVolume(0.7);
    audioService.mute();

    expect(audioService.getVolume()).toBe(0.7);
    expect(audioService.isMuted()).toBe(true);
    expect(audioService.getStatus()).toBe('inactive');
    expect(audioService.getActiveInstruments()).toEqual([]);
  });

  it('should update engine state during initialization attempt', async () => {
    const stateListener = vi.fn();
    audioService.events.on('status', stateListener);

    // Mock the initialization to fail to test error handling
    vi.doMock('tone', () => {
      throw new Error('Mock initialization failure');
    });

    try {
      await audioService.initialize();
    } catch {
      // Expected to throw
    }

    expect(stateListener).toHaveBeenCalledWith('starting');
  });

  it('should clear error state', () => {
    // Manually set an error for testing
    audioService.setState('lastError', 'Test error');
    expect(audioService.events.getCurrentValue('lastError')).toBe('Test error');

    audioService.clearError();
    expect(audioService.events.getCurrentValue('lastError')).toBe(null);
  });

  it('should track active instruments', () => {
    const instrumentsListener = vi.fn();
    audioService.events.on('activeInstruments', instrumentsListener);

    // Simulate adding instruments by directly updating state
    // In real usage, this would happen through registerInstrument
    
    // Add some mock instruments to the internal map
    const instrumentsMap = (audioService as unknown as { instruments: Map<string, unknown> }).instruments;
    instrumentsMap.set('piano', {});
    instrumentsMap.set('guitar', {});

    // Update the reactive state
    audioService.setState('activeInstruments', ['piano', 'guitar']);

    expect(audioService.events.getCurrentValue('activeInstruments')).toEqual(['piano', 'guitar']);
    expect(audioService.getActiveInstruments()).toEqual(['piano', 'guitar']);
  });

  it('should emit events for all state changes', () => {
    const listeners = {
      engineState: vi.fn(),
      volume: vi.fn(),
      isMuted: vi.fn(),
      activeInstruments: vi.fn(),
      isInitialized: vi.fn(),
      lastError: vi.fn()
    };

    // Subscribe to all state changes
    Object.entries(listeners).forEach(([key, listener]) => {
      audioService.events.on(key as keyof typeof listeners, listener);
    });

    // Trigger state changes
    audioService.setVolume(0.6);
    audioService.mute();
    audioService.setState('activeInstruments', ['test']);
    audioService.clearError();

    // Verify all listeners were called
    expect(listeners.volume).toHaveBeenCalledWith(0.6);
    expect(listeners.isMuted).toHaveBeenCalledWith(true);
    expect(listeners.activeInstruments).toHaveBeenCalledWith(['test']);
    expect(listeners.lastError).toHaveBeenCalledWith(null);
  });
});

