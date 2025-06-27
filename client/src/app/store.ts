import { createStore } from 'solid-js/store';
import type { Connection, NotesByMidi } from '../constants';
import type { Room } from '../lib/workspaceTypes';

// Workspace state types
export type Workspace = {
  roomId?: string,
  userId?: string,
  isValid?: boolean,
  isLoading?: boolean,
  room?: Room,
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

// Define the combined state type
export type RootState = {
  workspace: Workspace;
  notesByMidi: NotesByMidi;
  connection: Connection;
};

// Create the initial state
const initialState: RootState = {
  workspace: initialWorkspaceState,
  notesByMidi: initialNotesState,
  connection: initialConnectionState,
};

// Create a global store
export const [store, setStore] = createStore<RootState>(initialState);

// Export store provider that will be added later
export { StoreProvider } from './storeProvider';

// Simple hook to access the store
export function useStore() {
  return { state: store, setState: setStore };
}
