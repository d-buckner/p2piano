import { createStore } from 'solid-js/store';
import { initialSharedStore } from '../crdt/types/StoreTypes';
import { connectionStore } from '../stores/ConnectionStore';
import { midiStore } from '../stores/MidiStore';
import { recordingStore } from '../stores/RecordingStore';
import { workspaceStore } from '../stores/WorkspaceStore';
import type { SharedStore } from '../crdt/types/StoreTypes';

// Legacy Metronome state types (keeping for now during migration)
export type MetronomeState = {
  active: boolean;
  bpm: number;
  beatsPerMeasure: number;
  leaderId?: string;
};

// Define the combined state type
export type RootState = {
  workspace: typeof workspaceStore;
  connection: typeof connectionStore;
  midi: typeof midiStore;
  recording: typeof recordingStore;
  
  /** CRDT-based shared state */
  shared: SharedStore;
};

// Create the initial state
const initialState: RootState = {
  workspace: workspaceStore,
  connection: connectionStore,
  midi: midiStore,
  recording: recordingStore,
  shared: initialSharedStore,
};

// Create a global store
export const [store, setStore] = createStore<RootState>(initialState);

// Export store provider that will be added later
export { StoreProvider } from './storeProvider';

// Simple hook to access the store
export function useStore() {
  return { state: store, setState: setStore };
}

// Selectors
export const selectSharedState = (state: RootState) => state.shared;
