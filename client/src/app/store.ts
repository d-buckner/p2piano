import { createStore } from 'solid-js/store';
import { initialSharedStore } from '../crdt/types/StoreTypes';
import type { Connection, NotesByMidi } from '../constants';
import type { SharedStore } from '../crdt/types/StoreTypes';
import type { Room } from '../lib/workspaceTypes';

// Workspace state types
export type Workspace = {
  roomId?: string,
  userId?: string,
  isValid?: boolean,
  isLoading?: boolean,
  room?: Room,
};

// MIDI state types
export type MidiState = {
  enabled: boolean;
};

// Legacy Metronome state types (keeping for now during migration)
export type MetronomeState = {
  active: boolean;
  bpm: number;
  beatsPerMeasure: number;
  leaderId?: string;
};

// Initial states
const initialWorkspaceState: Workspace = {
  roomId: undefined,
  userId: undefined,
  isValid: undefined,
  isLoading: undefined,
  room: undefined,
};

const initialNotesState: NotesByMidi = {};

const initialConnectionState: Connection = {
  maxLatency: 0,
  peerConnections: {},
};

const initialMidiState: MidiState = {
  enabled: false,
};


// Define the combined state type
export type RootState = {
  workspace: Workspace;
  notesByMidi: NotesByMidi;
  connection: Connection;
  midi: MidiState;
  
  /** CRDT-based shared state */
  shared: SharedStore;
};

// Create the initial state
const initialState: RootState = {
  workspace: initialWorkspaceState,
  notesByMidi: initialNotesState,
  connection: initialConnectionState,
  midi: initialMidiState,
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
