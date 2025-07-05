import { describe, it, expect } from 'vitest';
import { selectMetronome } from './metronomeSelectors';
import type { RootState } from '../app/store';


describe('metronomeSelectors', () => {
  describe('selectMetronome', () => {
    it('should select metronome state', () => {
      const mockState: RootState = {
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
          enabled: false,
        },
        metronome: {
          active: true,
          bpm: 120,
          beatsPerMeasure: 4,
          leaderId: 'user-123',
        },
      };

      const result = selectMetronome(mockState);

      expect(result).toEqual({
        active: true,
        bpm: 120,
        beatsPerMeasure: 4,
        leaderId: 'user-123',
      });
    });

    it('should select default metronome state', () => {
      const mockState: RootState = {
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
          enabled: false,
        },
        metronome: {
          active: false,
          bpm: 60,
          beatsPerMeasure: 4,
          leaderId: undefined,
        },
      };

      const result = selectMetronome(mockState);

      expect(result).toEqual({
        active: false,
        bpm: 60,
        beatsPerMeasure: 4,
        leaderId: undefined,
      });
    });
  });
});