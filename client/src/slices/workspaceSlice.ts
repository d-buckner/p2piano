import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import type {
  Room,
} from '../lib/workspaceTypes';


export type Workspace = {
  roomId?: string,
  userId?: string,
  isValid?: boolean,
  isLoading?: boolean,
  room?: Room,
};

export const initialWorkspaceState: Workspace = {
  roomId: undefined,
  userId: undefined,
  isValid: undefined,
  isLoading: undefined,
  room: undefined,
};

type SetRoomIdPayload = { roomId: string };
type InitializeRoomPayload = {
  userId: string,
  room: Room,
};
type SetIsLoadingPayload = { isLoading: boolean };
type SetValidityPayload = { isValid: boolean };
type SetRoomPayload = { room: Room };

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: initialWorkspaceState,
  reducers: {
    setRoomId: (state, action: PayloadAction<SetRoomIdPayload>) => {
      state.roomId = action.payload.roomId;
    },
    initializeRoom: (state, action: PayloadAction<InitializeRoomPayload>) => {
      const { room, userId } = action.payload;
      state.userId = userId;
      state.room = room;
    },
    setIsLoading: (state, action: PayloadAction<SetIsLoadingPayload>) => {
      state.isLoading = action.payload.isLoading;
    },
    setValidity: (state, action: PayloadAction<SetValidityPayload>) => {
      state.isValid = action.payload.isValid;
    },
    setRoom: (state, action: PayloadAction<SetRoomPayload>) => {
      const { room } = action.payload;
      state.room = room;
    },
    reset: (state) => {
      Object.entries(initialWorkspaceState).forEach(([key, val]) => {
        // @ts-expect-error object.entries removes key/value type constraints
        state[key] = val;
      });
    },
  },
})

export const {
  setRoomId,
  setIsLoading,
  setValidity,
  initializeRoom,
  reset,
  setRoom,
} = workspaceSlice.actions;

export const selectWorkspace = (state: RootState) => state.workspace;
export const selectMyUser = (state: RootState) => {
  const workspace = selectWorkspace(state);
  const { userId, room } = workspace;
  if (userId) {
    return room?.users?.[userId];
  }
}
export const selectUsers = (state: RootState) => selectWorkspace(state).room?.users ?? {};

export const workspaceReducer = workspaceSlice.reducer;
