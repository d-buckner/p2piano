import { createStore } from 'solid-js/store';
import { initialConnectionState } from '../slices/connectionSlice';
import { initialNotesState } from '../slices/notesSlice';
import { initialWorkspaceState } from '../slices/workspaceSlice';

// Define the combined state type
export type RootState = {
  workspace: typeof initialWorkspaceState;
  notesByMidi: typeof initialNotesState;
  connection: typeof initialConnectionState;
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
