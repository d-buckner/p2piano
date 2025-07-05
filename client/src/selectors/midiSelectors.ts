import type { RootState } from '../app/store';


export const selectMidi = (state: RootState) => state.midi;

export const selectMidiEnabled = (state: RootState) => state.midi.enabled;