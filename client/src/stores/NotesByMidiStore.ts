import { createStore } from 'solid-js/store';
import type { NotesByMidi } from '../constants';


const initialNotesState: NotesByMidi = {};

export const [notesByMidiStore, setNotesByMidiStore] = createStore<NotesByMidi>(initialNotesState);
