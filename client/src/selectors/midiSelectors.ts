import type { RootState } from '../app/store';


export const selectMidi = (state: RootState) => state.midi;
export const selectMidiEnabled = (state: RootState) => state.midi.enabled;
export const selectMidiAccess = (state: RootState) => state.midi.hasAccess;
export const selectMidiInputs = (state: RootState) => state.midi.inputs;
export const selectSelectedMidiInput = (state: RootState) => state.midi.selectedInput;
