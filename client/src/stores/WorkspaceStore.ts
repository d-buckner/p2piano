import { createStore } from 'solid-js/store';
import type { Room } from '../lib/workspaceTypes';


export type WorkspaceState = {
  roomId?: string;
  userId?: string;
  isValid?: boolean;
  isLoading?: boolean;
  room?: Room;
};

const initialWorkspaceState: WorkspaceState = {
  roomId: undefined,
  userId: undefined,
  isValid: undefined,
  isLoading: undefined,
  room: undefined,
};

export const [workspaceStore, setWorkspaceStore] = createStore<WorkspaceState>(initialWorkspaceState);
