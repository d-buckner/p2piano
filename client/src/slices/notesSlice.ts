import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import type { Note, NotesByMidi } from '../constants';


type RemoveNotesFromAuthorPayload = {
  peerId: string,
};

export const initialNotesState: NotesByMidi = {};

export const notesSlice = createSlice({
  name: 'notes',
  initialState: initialNotesState,
  reducers: {
    addNote: (state, action: PayloadAction<Note>) => {
      const note = action.payload;
      if (!state[note.midi]) {
        state[note.midi] = [];
      }

      const existingNoteIndex = state[note.midi]
        .findIndex(n => n.peerId === note.peerId);
      if (existingNoteIndex === -1) {
        state[note.midi].push(note);
      }

      state[note.midi][existingNoteIndex] = note;
    },

    removeNote: (state, action: PayloadAction<Note>) => {
      const { midi, peerId } = action.payload;
      const midiMatchedNotes = state[midi];

      if (!midiMatchedNotes) {
        return;
      }

      const noteToRemoveIndex = midiMatchedNotes.findIndex(note => note.peerId === peerId);
      if (noteToRemoveIndex === -1) {
        return;
      }

      if (midiMatchedNotes.length === 1) {
        delete state[midi];
        return;
      }

      midiMatchedNotes.splice(noteToRemoveIndex, 1);
    },

    removeNotesFromPeer: (state, action: PayloadAction<RemoveNotesFromAuthorPayload>) => {
      const { peerId } = action.payload;
      Object.entries(state).forEach(([midi, midiNotes]) => {
        const newMidiNotes = midiNotes.filter(n => n.peerId !== peerId);
        if (newMidiNotes.length === 0) {
          delete state[midi];
          return;
        }

        if (midiNotes.length === newMidiNotes.length) {
          return;
        }

        state[midi] = newMidiNotes;
      });
    },
  },
});

export const {
  addNote,
  removeNote,
  removeNotesFromPeer,
} = notesSlice.actions;

export const selectNotes = (state: RootState) => state.notesByMidi;

export const notesReducer = notesSlice.reducer;
