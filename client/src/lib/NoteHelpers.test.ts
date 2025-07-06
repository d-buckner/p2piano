import { describe, it, expect } from 'vitest';
import { toFrequency, getNotes } from './NoteHelpers';
import type { NotesByMidi } from '../constants';


describe('NoteHelpers', () => {
  describe('toFrequency', () => {
    it('should convert MIDI note 69 (A4) to 440 Hz', () => {
      expect(toFrequency(69)).toBeCloseTo(440, 1);
    });

    it('should convert MIDI note 60 (C4) to ~261 Hz', () => {
      expect(toFrequency(60)).toBe(261);
    });

    it('should convert MIDI note 81 (A5) to 879 Hz', () => {
      expect(toFrequency(81)).toBe(879);
    });

    it('should handle edge cases', () => {
      expect(toFrequency(0)).toBe(8);
      expect(toFrequency(127)).toBe(12543);
    });
  });

  describe('getNotes', () => {
    it('should return empty array for empty notesByMidi', () => {
      const notesByMidi: NotesByMidi = {};
      expect(getNotes(notesByMidi)).toEqual([]);
    });

    it('should flatten notesByMidi to array of notes', () => {
      const notesByMidi: NotesByMidi = {
        60: [{
          peerId: 'user1',
          midi: 60,
          velocity: 127
        }],
        64: [{
          peerId: 'user2',
          midi: 64,
          velocity: 100
        }]
      };

      const result = getNotes(notesByMidi);
      expect(result).toHaveLength(2);
      expect(result[0].midi).toBe(60);
      expect(result[1].midi).toBe(64);
    });

    it('should preserve note properties', () => {
      const notesByMidi: NotesByMidi = {
        72: [{
          peerId: 'user3',
          midi: 72,
          velocity: 64
        }]
      };

      const result = getNotes(notesByMidi);
      expect(result[0]).toEqual({
        peerId: 'user3',
        midi: 72,
        velocity: 64
      });
    });
  });
});
