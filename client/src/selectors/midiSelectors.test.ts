import { describe, it, expect } from 'vitest';
import { selectMidi, selectMidiEnabled } from './midiSelectors';
import type { RootState } from '../app/store';


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
      });
    });

    it('should select midi state when disabled', () => {
      const mockState = createMockState(false);

      const result = selectMidi(mockState);

      expect(result).toEqual({
        enabled: false,
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
});