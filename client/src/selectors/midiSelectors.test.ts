import { describe, it, expect } from 'vitest';
import { selectMidi, selectMidiEnabled, selectMidiInputs, selectSelectedMidiInput } from './midiSelectors';
import type { RootState } from '../app/store';
import type { DeviceMetadata } from 'humidi';


describe('midiSelectors', () => {
  const createMockState = (midiEnabled: boolean): RootState => ({
    workspace: {
      roomId: undefined,
      userId: undefined,
      isValid: undefined,
      isLoading: undefined,
      room: undefined,
    },
    notesByMidi: {},
    connection: {
      maxLatency: 0,
      peerConnections: {},
    },
    midi: {
      enabled: midiEnabled,
      hasAccess: false,
      selectedInputId: null,
      inputs: {},
    },
    metronome: {
      active: false,
      bpm: 60,
      beatsPerMeasure: 4,
      leaderId: undefined,
    },
  });

  describe('selectMidi', () => {
    it('should select midi state when enabled', () => {
      const mockState = createMockState(true);

      const result = selectMidi(mockState);

      expect(result).toEqual({
        enabled: true,
        hasAccess: false,
        selectedInputId: null,
        inputs: {},
      });
    });

    it('should select midi state when disabled', () => {
      const mockState = createMockState(false);

      const result = selectMidi(mockState);

      expect(result).toEqual({
        enabled: false,
        hasAccess: false,
        selectedInputId: null,
        inputs: {},
      });
    });
  });

  describe('selectMidiEnabled', () => {
    it('should return true when MIDI is enabled', () => {
      const mockState = createMockState(true);

      const result = selectMidiEnabled(mockState);

      expect(result).toBe(true);
    });

    it('should return false when MIDI is disabled', () => {
      const mockState = createMockState(false);

      const result = selectMidiEnabled(mockState);

      expect(result).toBe(false);
    });
  });

  describe('selectMidiInputs', () => {
    it('should return empty object when no inputs', () => {
      const mockState = createMockState(false);
      
      const result = selectMidiInputs(mockState);
      
      expect(result).toEqual({});
    });
    
    it('should return inputs record', () => {
      const mockDevice: DeviceMetadata = {
        id: 'device1',
        name: 'Piano',
        manufacturer: 'Test',
        state: 'connected',
        enabled: true,
      };
      
      const mockState = {
        ...createMockState(false),
        midi: {
          enabled: false,
          hasAccess: false,
          selectedInputId: null,
          inputs: { device1: mockDevice },
        },
      };
      
      const result = selectMidiInputs(mockState);
      
      expect(result).toEqual({ device1: mockDevice });
    });
  });

  describe('selectSelectedMidiInput', () => {
    const mockDevice: DeviceMetadata = {
      id: 'device1',
      name: 'Piano',
      manufacturer: 'Test',
      state: 'connected',
      enabled: true,
    };
    
    it('should return null when no device selected', () => {
      const mockState = createMockState(false);
      
      const result = selectSelectedMidiInput(mockState);
      
      expect(result).toBe(null);
    });
    
    it('should return selected device when available', () => {
      const mockState = {
        ...createMockState(false),
        midi: {
          enabled: false,
          hasAccess: false,
          selectedInputId: 'device1',
          inputs: { device1: mockDevice },
        },
      };
      
      const result = selectSelectedMidiInput(mockState);
      
      expect(result).toEqual(mockDevice);
    });
    
    it('should return null when selected device is not in inputs', () => {
      const mockState = {
        ...createMockState(false),
        midi: {
          enabled: false,
          hasAccess: false,
          selectedInputId: 'device1',
          inputs: {},
        },
      };
      
      const result = selectSelectedMidiInput(mockState);
      
      expect(result).toBe(null);
    });
  });
});
