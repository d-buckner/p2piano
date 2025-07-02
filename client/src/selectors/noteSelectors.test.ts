import { describe, it, expect } from 'vitest';
import { createTestNote } from '../test-utils/testDataFactories';
import { 
  selectNotesByMidi, 
  selectNotes, 
  selectNotesForMidi, 
  selectNotesForPeer 
} from './noteSelectors';
import type { RootState } from '../app/store';


const createMockState = (notesByMidi: RootState['notesByMidi'] = {}): RootState => ({
  notesByMidi,
  workspace: {
    room: null,
    userId: null,
  },
  connections: {
    peers: {},
    maxLatency: 0,
  },
});

describe('noteSelectors', () => {
  describe('selectNotesByMidi', () => {
    it('should return the notesByMidi object from state', () => {
      const notesByMidi = {
        '60': [createTestNote({ midi: 60, peerId: 'user1' })],
        '64': [createTestNote({ midi: 64, peerId: 'user2' })],
      };
      const state = createMockState(notesByMidi);

      const result = selectNotesByMidi(state);

      expect(result).toBe(notesByMidi);
    });

    it('should return empty object when no notes exist', () => {
      const state = createMockState({});

      const result = selectNotesByMidi(state);

      expect(result).toEqual({});
    });
  });

  describe('selectNotes', () => {
    it('should return array of latest notes for each MIDI value', () => {
      const notesByMidi = {
        '60': [
          createTestNote({ midi: 60, peerId: 'user1' }),
          createTestNote({ midi: 60, peerId: 'user2' }), // Latest for MIDI 60
        ],
        '64': [
          createTestNote({ midi: 64, peerId: 'user1' }), // Latest for MIDI 64
        ],
      };
      const state = createMockState(notesByMidi);

      const result = selectNotes(state);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(createTestNote({ midi: 60, peerId: 'user2' }));
      expect(result[1]).toEqual(createTestNote({ midi: 64, peerId: 'user1' }));
    });

    it('should return empty array when no notes exist', () => {
      const state = createMockState({});

      const result = selectNotes(state);

      expect(result).toEqual([]);
    });

    it('should handle MIDI values with empty note arrays', () => {
      const notesByMidi = {
        '60': [],
        '64': [createTestNote({ midi: 64, peerId: 'user1' })],
      };
      const state = createMockState(notesByMidi);

      const result = selectNotes(state);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(createTestNote({ midi: 64, peerId: 'user1' }));
    });

    it('should return only the latest note when multiple notes exist for same MIDI', () => {
      const oldNote = createTestNote({ midi: 60, peerId: 'user1' });
      const newNote = createTestNote({ midi: 60, peerId: 'user2' });
      
      const notesByMidi = {
        '60': [oldNote, newNote],
      };
      const state = createMockState(notesByMidi);

      const result = selectNotes(state);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(newNote);
      expect(result[0]).not.toBe(oldNote);
    });
  });

  describe('selectNotesForMidi', () => {
    it('should return notes for specific MIDI value', () => {
      const notes60 = [
        createTestNote({ midi: 60, peerId: 'user1' }),
        createTestNote({ midi: 60, peerId: 'user2' }),
      ];
      const notes64 = [
        createTestNote({ midi: 64, peerId: 'user1' }),
      ];
      
      const notesByMidi = {
        '60': notes60,
        '64': notes64,
      };
      const state = createMockState(notesByMidi);

      const result = selectNotesForMidi(60)(state);

      expect(result).toEqual(notes60);
      expect(result).toHaveLength(2);
    });

    it('should return empty array for MIDI value with no notes', () => {
      const notesByMidi = {
        '60': [createTestNote({ midi: 60, peerId: 'user1' })],
      };
      const state = createMockState(notesByMidi);

      const result = selectNotesForMidi(64)(state);

      expect(result).toEqual([]);
    });

    it('should return empty array for non-existent MIDI value', () => {
      const state = createMockState({});

      const result = selectNotesForMidi(60)(state);

      expect(result).toEqual([]);
    });

    it('should handle edge case MIDI values', () => {
      const notesByMidi = {
        '0': [createTestNote({ midi: 0, peerId: 'user1' })],
        '127': [createTestNote({ midi: 127, peerId: 'user2' })],
      };
      const state = createMockState(notesByMidi);

      expect(selectNotesForMidi(0)(state)).toHaveLength(1);
      expect(selectNotesForMidi(127)(state)).toHaveLength(1);
    });
  });

  describe('selectNotesForPeer', () => {
    it('should return all notes for specific peer', () => {
      const notesByMidi = {
        '60': [
          createTestNote({ midi: 60, peerId: 'user1' }),
          createTestNote({ midi: 60, peerId: 'user2' }),
        ],
        '64': [
          createTestNote({ midi: 64, peerId: 'user1' }),
          createTestNote({ midi: 64, peerId: 'user3' }),
        ],
        '67': [
          createTestNote({ midi: 67, peerId: 'user2' }),
        ],
      };
      const state = createMockState(notesByMidi);

      const result = selectNotesForPeer('user1')(state);

      expect(result).toHaveLength(2);
      expect(result.every(note => note.peerId === 'user1')).toBe(true);
      expect(result.map(note => note.midi)).toEqual([60, 64]);
    });

    it('should return empty array for peer with no notes', () => {
      const notesByMidi = {
        '60': [createTestNote({ midi: 60, peerId: 'user1' })],
      };
      const state = createMockState(notesByMidi);

      const result = selectNotesForPeer('user2')(state);

      expect(result).toEqual([]);
    });

    it('should return empty array when no notes exist', () => {
      const state = createMockState({});

      const result = selectNotesForPeer('user1')(state);

      expect(result).toEqual([]);
    });

    it('should handle multiple notes per MIDI value for same peer', () => {
      const notesByMidi = {
        '60': [
          createTestNote({ midi: 60, peerId: 'user1' }),
          createTestNote({ midi: 60, peerId: 'user1' }), // Same peer, same MIDI
          createTestNote({ midi: 60, peerId: 'user2' }),
        ],
      };
      const state = createMockState(notesByMidi);

      const result = selectNotesForPeer('user1')(state);

      expect(result).toHaveLength(2);
      expect(result.every(note => note.peerId === 'user1')).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex state with multiple users and MIDI values', () => {
      const notesByMidi = {
        '60': [
          createTestNote({ midi: 60, peerId: 'pianist' }),
          createTestNote({ midi: 60, peerId: 'guitarist' }),
        ],
        '64': [
          createTestNote({ midi: 64, peerId: 'pianist' }),
        ],
        '67': [
          createTestNote({ midi: 67, peerId: 'bassist' }),
          createTestNote({ midi: 67, peerId: 'drummer' }),
        ],
      };
      const state = createMockState(notesByMidi);

      // Test all selectors work together correctly
      const allNotesByMidi = selectNotesByMidi(state);
      const latestNotes = selectNotes(state);
      const pianistNotes = selectNotesForPeer('pianist')(state);
      const notes60 = selectNotesForMidi(60)(state);

      expect(Object.keys(allNotesByMidi)).toEqual(['60', '64', '67']);
      expect(latestNotes).toHaveLength(3); // Latest for each MIDI
      expect(pianistNotes).toHaveLength(2); // Pianist plays 60 and 64
      expect(notes60).toHaveLength(2); // Two people playing MIDI 60
    });
  });
});