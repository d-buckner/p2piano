import type { RootState } from '../app/store';


export const selectConnection = (state: RootState) => state.connection;

export const selectPeerConnections = (state: RootState) => state.connection.peerConnections;

export const selectMaxLatency = (state: RootState) => state.connection.maxLatency;

export const selectPeerConnection = (peerId: string) => (state: RootState) => 
  state.connection.peerConnections[peerId];

export const selectConnectedPeerIds = (state: RootState) => 
  Object.keys(state.connection.peerConnections);
