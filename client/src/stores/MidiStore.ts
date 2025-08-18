import { createStore } from 'solid-js/store';
import type { DeviceMetadata } from 'humidi';


export type MidiState = {
  hasAccess: boolean;
  enabled: boolean;
  selectedInputId: string | null,
  inputs: Record<string, DeviceMetadata>;
};

const initialMidiState: MidiState = {
  hasAccess: false,
  enabled: false,
  selectedInputId: null,
  inputs: {},
};

export const [midiStore, setMidiStore] = createStore<MidiState>(initialMidiState);
