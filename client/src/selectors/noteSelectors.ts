import type { RootState } from '../app/store';
import type { Note } from '../constants';


export const selectNotesByMidi = (state: RootState) => state.notesByMidi;

export const selectNotes = (state: RootState): Note[] => {
  return Object.entries(state.notesByMidi).reduce((notes, midiNotes) => {
    const noteEntries = midiNotes[1];
    const note = noteEntries[noteEntries.length - 1];
    if (note) {
      notes.push(note);
    }
    return notes;
  }, [] as Note[]);
};

export const selectNotesForMidi = (midi: number) => (state: RootState) => 
  state.notesByMidi[midi.toString()] ?? [];

export const selectNotesForPeer = (peerId: string) => (state: RootState): Note[] => {
  return Object.values(state.notesByMidi)
    .flat()
    .filter(note => note.peerId === peerId);
};
