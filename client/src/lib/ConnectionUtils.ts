import store from "../app/store";
import { selectPeerConnections } from "../slices/connectionSlice";

export function getPeerConnections() {
  const state = store.getState();
  return selectPeerConnections(state);
}

export function getConnectedPeerIds(): string[] {
  return Object.keys(getPeerConnections());
}

export function getPeerConnection(peerId: string) {
  return getPeerConnections()[peerId];
}
