import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import Logger from '../lib/Logger';
import type { RootState } from '../app/store';
import type { Connection, Transport } from '../constants';


interface PeerLatencyPayload {
  peerId: string;
  latency: number;
}

interface PeerTransportPayload {
  peerId: string;
  transport: Transport;
}

const initialState: Connection = {
  maxLatency: 0,
  peerConnections: {},
};

export const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setPeerLatency: (state, action: PayloadAction<PeerLatencyPayload>) => {
      const { peerId, latency } = action.payload;
      state.peerConnections[peerId].latency = latency;
    },
    setPeerTransport: (state, action: PayloadAction<PeerTransportPayload>) => {
      const { peerId, transport } = action.payload;
      if (!state.peerConnections[peerId]) {
        Logger.WARN('Cannot set peer transport for disconnected peer');
        return;
      }

      state.peerConnections[peerId].transport = transport;
    },
    addPeerConnection: (state, action: PayloadAction<PeerTransportPayload>) => {
      const { peerId, transport } = action.payload;
      state.peerConnections[peerId] = {
        latency: 0,
        transport
      };
    },
    setMaxLatency: (state, action: PayloadAction<number>) => {
      state.maxLatency = action.payload;
    },
    removePeerConnection: (state, action: PayloadAction<string>) => {
      delete state.peerConnections[action.payload];
    },
  },
});

export const connectionActions = connectionSlice.actions;
export const connectionReducer = connectionSlice.reducer;

export const selectMaxLatency = (state: RootState) => (
  state.connection.maxLatency
);
export const selectPeerConnections = (state: RootState) => (
  state.connection.peerConnections
);
