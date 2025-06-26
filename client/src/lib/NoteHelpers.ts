import type { Note, NotesByMidi } from '../constants';


export function getNotes(notesByMidi: NotesByMidi): Note[] {
  return Object.entries(notesByMidi).reduce((notes, midiNotes) => {
    const noteEntries = midiNotes[1];
    const note = noteEntries[noteEntries.length - 1];
    if (note) {
      notes.push(note);
    }
    return notes;
  }, [] as Note[]);
}

export function toFrequency(midi: number): number {
  return Math.floor(440 * (1.059463094359 ** (midi - 69)));
}
