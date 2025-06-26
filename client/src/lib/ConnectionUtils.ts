import { store } from '../app/store';
import { selectPeerConnections } from '../slices/connectionSlice';


export function getPeerConnections() {
  return selectPeerConnections(store);
}

export function getConnectedPeerIds(): string[] {
  return Object.keys(getPeerConnections());
}

export function getPeerConnection(peerId: string) {
  return getPeerConnections()[peerId];
}
