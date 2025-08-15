import { createStore } from 'solid-js/store';


export type MidiState = {
  hasAccess: boolean;
  enabled: boolean;
  inputs: MIDIInput[];
};

const initialMidiState: MidiState = {
  hasAccess: false,
  enabled: false,
  inputs: [],
};

export const [midiStore, setMidiStore] = createStore<MidiState>(initialMidiState);
