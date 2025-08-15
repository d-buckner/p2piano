import { createStore } from 'solid-js/store';
import type { Connection } from '../constants';


const initialConnectionState: Connection = {
  maxLatency: 0,
  peerConnections: {},
};

export const [connectionStore, setConnectionStore] = createStore<Connection>(initialConnectionState);
