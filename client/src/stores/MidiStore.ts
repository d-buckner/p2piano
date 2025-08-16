import { createStore } from 'solid-js/store';
import type { MIDIInput } from 'humidi';


export type MidiState = {
  hasAccess: boolean;
  enabled: boolean;
  selectedInput: MIDIInput | null,
  inputs: MIDIInput[];
};

const initialMidiState: MidiState = {
  hasAccess: false,
  enabled: false,
  selectedInput: null,
  inputs: [],
};

export const [midiStore, setMidiStore] = createStore<MidiState>(initialMidiState);
