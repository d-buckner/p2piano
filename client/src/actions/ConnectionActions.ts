import { setStore, store } from '../app/store';
import { Transport } from '../constants';


export function addPeerConnection(userId: string, transport: Transport = Transport.WEBSOCKET, latency: number = 0) {
  setStore('connection', 'peerConnections', userId, {
    latency,
    transport,
  });
}

export function removePeerConnection(userId: string) {
  setStore('connection', 'peerConnections', (connections) => {
    const newConnections = { ...connections };
    delete newConnections[userId];
    return newConnections;
  });
}

export function updatePeerTransport(userId: string, transport: Transport) {
  setStore('connection', 'peerConnections', userId, 'transport', transport);
}

export function updatePeerLatency(userId: string, latency: number) {
  // Only update latency if peer connection already exists
  // This prevents re-creating connections for disconnected peers
  const currentConnections = store.connection?.peerConnections;
  if (currentConnections?.[userId]) {
    setStore('connection', 'peerConnections', userId, 'latency', latency);
  }
}

export function setMaxLatency(maxLatency: number) {
  setStore('connection', 'maxLatency', maxLatency);
}
