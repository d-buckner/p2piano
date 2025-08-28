import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AudioManager from '../AudioManager';
import { InstrumentType } from './Instrument';
import InstrumentRegistry from './InstrumentRegistry';

// Mock AudioManager
vi.mock('../AudioManager', () => ({
  default: {
    whenActive: vi.fn(),
  },
}));

// Mock instrument imports
vi.mock('./Piano', () => ({
  default: class MockPiano {
    releaseAll = vi.fn();
    keyDown = vi.fn();
    keyUp = vi.fn();
  },
}));

vi.mock('./Synth', () => ({
  default: class MockSynth {
    releaseAll = vi.fn();
    keyDown = vi.fn();
    keyUp = vi.fn();
  },
}));

vi.mock('./ElectricBass', () => ({
  default: class MockElectricBass {
    releaseAll = vi.fn();
    keyDown = vi.fn();
    keyUp = vi.fn();
  },
}));


describe('InstrumentType', () => {
  describe('enum values', () => {
    it('should define PIANO instrument type', () => {
      expect(InstrumentType.PIANO).toBe('PIANO');
    });

    it('should define SYNTH instrument type', () => {
      expect(InstrumentType.SYNTH).toBe('SYNTH');
    });

    it('should define ELECTRIC_BASS instrument type', () => {
      expect(InstrumentType.ELECTRIC_BASS).toBe('ELECTRIC_BASS');
    });
  });

  describe('enum completeness', () => {
    it('should contain exactly the expected instrument types', () => {
      const instrumentTypes = Object.values(InstrumentType);
      expect(instrumentTypes).toEqual(['PIANO', 'SYNTH', 'ELECTRIC_BASS']);
    });

    it('should have stable enum keys for backwards compatibility', () => {
      // Ensures enum keys remain stable for serialization/API compatibility
      expect(Object.keys(InstrumentType)).toEqual(['PIANO', 'SYNTH', 'ELECTRIC_BASS']);
    });
  });
});

describe('InstrumentRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    InstrumentRegistry.empty();
    // Default AudioManager.whenActive to call callback immediately
    vi.mocked(AudioManager.whenActive).mockImplementation((callback) => {
      callback();
    });
  });

  afterEach(() => {
    InstrumentRegistry.empty();
  });

  describe('register', () => {
    it('should register a piano instrument for a user', async () => {
      await InstrumentRegistry.register('user1', InstrumentType.PIANO);
      
      const instrument = InstrumentRegistry.get('user1');
      expect(instrument).toBeDefined();
    });

    it('should register a synth instrument for a user', async () => {
      await InstrumentRegistry.register('user2', InstrumentType.SYNTH);
      
      const instrument = InstrumentRegistry.get('user2');
      expect(instrument).toBeDefined();
    });

    it('should register an electric bass instrument for a user', async () => {
      await InstrumentRegistry.register('user3', InstrumentType.ELECTRIC_BASS);
      
      const instrument = InstrumentRegistry.get('user3');
      expect(instrument).toBeDefined();
    });

    it('should replace existing instrument when registering same user', async () => {
      // First registration
      await InstrumentRegistry.register('user1', InstrumentType.PIANO);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const firstInstrument = InstrumentRegistry.get('user1');
      
      // Second registration
      await InstrumentRegistry.register('user1', InstrumentType.SYNTH);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const secondInstrument = InstrumentRegistry.get('user1');
      
      expect(firstInstrument).not.toBe(secondInstrument);
      expect(firstInstrument?.releaseAll).toHaveBeenCalled();
    });

    it('should wait for AudioManager to be active before registering', () => {
      InstrumentRegistry.register('user1', InstrumentType.PIANO);
      
      expect(AudioManager.whenActive).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('get', () => {
    it('should return null for unregistered user', () => {
      const instrument = InstrumentRegistry.get('nonexistent');
      expect(instrument).toBeNull();
    });

    it('should return registered instrument for user', async () => {
      await InstrumentRegistry.register('user1', InstrumentType.PIANO);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const instrument = InstrumentRegistry.get('user1');
      expect(instrument).toBeDefined();
      expect(instrument).not.toBeNull();
    });
  });

  describe('unregister', () => {
    it('should remove user and release their instrument', async () => {
      await InstrumentRegistry.register('user1', InstrumentType.PIANO);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const instrument = InstrumentRegistry.get('user1');
      expect(instrument).toBeDefined();
      
      InstrumentRegistry.unregister('user1');
      
      expect(instrument?.releaseAll).toHaveBeenCalled();
      expect(InstrumentRegistry.get('user1')).toBeNull();
    });

    it('should handle unregistering non-existent user gracefully', () => {
      expect(() => {
        InstrumentRegistry.unregister('nonexistent');
      }).not.toThrow();
    });
  });

  describe('empty', () => {
    it('should clear all registered instruments', async () => {
      await InstrumentRegistry.register('user1', InstrumentType.PIANO);
      await InstrumentRegistry.register('user2', InstrumentType.SYNTH);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(InstrumentRegistry.get('user1')).toBeDefined();
      expect(InstrumentRegistry.get('user2')).toBeDefined();
      
      InstrumentRegistry.empty();
      
      expect(InstrumentRegistry.get('user1')).toBeNull();
      expect(InstrumentRegistry.get('user2')).toBeNull();
    });
  });

  describe('multiple users', () => {
    it('should handle multiple users with different instruments', async () => {
      await InstrumentRegistry.register('pianist', InstrumentType.PIANO);
      await InstrumentRegistry.register('synth-player', InstrumentType.SYNTH);
      await InstrumentRegistry.register('bassist', InstrumentType.ELECTRIC_BASS);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(InstrumentRegistry.get('pianist')).toBeDefined();
      expect(InstrumentRegistry.get('synth-player')).toBeDefined();
      expect(InstrumentRegistry.get('bassist')).toBeDefined();
      
      // Each should be different instances
      const piano = InstrumentRegistry.get('pianist');
      const synth = InstrumentRegistry.get('synth-player');
      const bass = InstrumentRegistry.get('bassist');
      
      expect(piano).not.toBe(synth);
      expect(synth).not.toBe(bass);
      expect(piano).not.toBe(bass);
    });
  });
});
