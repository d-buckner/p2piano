import { Transport } from '../constants';
import { connectionStore, setConnectionStore } from '../stores/ConnectionStore';


const Attributes = {
  MAX_LATENCY: 'maxLatency',
  PEER_CONNECTIONS: 'peerConnections',
} as const;

export function addPeerConnection(userId: string, transport: Transport = Transport.WEBSOCKET, latency: number = 0) {
  setConnectionStore(Attributes.PEER_CONNECTIONS, userId, {
    latency,
    transport,
  });
}

export function removePeerConnection(userId: string) {
  setConnectionStore(Attributes.PEER_CONNECTIONS, (connections) => {
    const newConnections = { ...connections };
    delete newConnections[userId];
    return newConnections;
  });
}

export function updatePeerTransport(userId: string, transport: Transport) {
  setConnectionStore(Attributes.PEER_CONNECTIONS, userId, 'transport', transport);
}

export function updatePeerLatency(userId: string, latency: number) {
  // Only update latency if peer connection already exists
  // This prevents re-creating connections for disconnected peers
  const currentConnections = connectionStore.peerConnections;
  if (currentConnections?.[userId]) {
    setConnectionStore(Attributes.PEER_CONNECTIONS, userId, 'latency', latency);
  }
}

export function setMaxLatency(maxLatency: number) {
  setConnectionStore(Attributes.MAX_LATENCY, maxLatency);
}
