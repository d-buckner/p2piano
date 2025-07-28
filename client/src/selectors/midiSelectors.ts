import type { RootState } from '../app/store';


export const selectMidi = (state: RootState) => state.midi;

export const selectMidiEnabled = (state: RootState) => selectMidi(state).enabled;
export const selectMidiAccess = (state: RootState) => selectMidi(state).hasAccess;
