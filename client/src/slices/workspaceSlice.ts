import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../app/store';
import type {
  Room,
} from '../lib/workspaceTypes';
import { MidiRange, Transport } from '../constants';

type Connection = {
  transport: Transport,
};

type Connections = {
  [userId: string]: Connection,
};

export type Workspace = {
  roomId?: string,
  connectionId?: string,
  isValid?: boolean,
  isLoading?: boolean,
  room?: Room,
  midiRange: MidiRange,
  connections: Connections,
};

const initialState: Workspace = {
  roomId: undefined,
  connectionId: undefined,
  connections: {},
  isValid: undefined,
  isLoading: undefined,
  room: undefined,
  midiRange: [60, 72],
};

type SetRoomIdPayload = { roomId: string };
type InitializeRoomPayload = {
  userId: string,
  room: Room,
};
type SetIsLoadingPayload = { isLoading: boolean };
type SetValidityPayload = { isValid: boolean };
type SetRoomPayload = { room: Room };
type SetMidiRangePayload = { midiRange: MidiRange };
type SetConnectionPayload = { userId: string } & Connection;
type RemoveConnectionPayload = { userId: string };
type DowngradeConnectionPayload = { userId: string };

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setRoomId: (state, action: PayloadAction<SetRoomIdPayload>) => {
      state.roomId = action.payload.roomId;
    },
    initializeRoom: (state, action: PayloadAction<InitializeRoomPayload>) => {
      const { room, userId } = action.payload;
      state.connectionId = userId;
      state.room = room;
      const connections: Connections = {};
      Object.keys(room.users).forEach(userId => {
        if (userId === state.connectionId) {
          return;
        }
        connections[userId] = { transport: Transport.WEBSOCKETS };
      });
      state.connections = connections;
    },
    setConnection: (state, action: PayloadAction<SetConnectionPayload>) => {
      const { userId, ...connection } = action.payload;
      state.connections[userId] = connection;
    },
    downgradeConnection: (state, action: PayloadAction<DowngradeConnectionPayload>) => {
      const { userId } = action.payload;
      if (state.connections[userId]) {
        state.connections[userId].transport = Transport.WEBSOCKETS;
      }
    },
    removeConnection: (state, action: PayloadAction<RemoveConnectionPayload>) => {
      const { userId } = action.payload;
      delete state.connections[userId];
    },
    setIsLoading: (state, action: PayloadAction<SetIsLoadingPayload>) => {
      state.isLoading = action.payload.isLoading;
    },
    setValidity: (state, action: PayloadAction<SetValidityPayload>) => {
      state.isValid = action.payload.isValid;
    },
    setMidiRange: (state, action: PayloadAction<SetMidiRangePayload>) => {
      const { midiRange } = action.payload;
      if (midiRange[0] < 12 || midiRange[1] > 84) {
        return;
      }
      if (midiRange[1] - midiRange[0] < 7) {
        return;
      }
      state.midiRange = midiRange;
    },
    setRoom: (state, action: PayloadAction<SetRoomPayload>) => {
      const { room } = action.payload;
      state.room = room;
    },
    reset: (state) => {
      Object.entries(initialState).forEach(([key, val]) => {
        // @ts-ignore
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
  setConnection,
  removeConnection,
  downgradeConnection,
  reset,
  setMidiRange,
  setRoom,
} = workspaceSlice.actions;

export const selectWorkspace = (state: RootState) => state.workspace;

export const workspaceReducer = workspaceSlice.reducer;
