import store from '../../app/store';
import { selectMaxLatency, selectPeerConnections } from '../../slices/connectionSlice';
import { selectWorkspace } from '../../slices/workspaceSlice';
import { MIN_LATENCY_CUTOFF_MS } from './constants';


export function getAudioDelay(userId: string): number | undefined {
  const state = store.getState();
  const workspace = selectWorkspace(state);
  const maxLatency = selectMaxLatency(state);
  if (userId === workspace.userId) {
    return maxLatency;
  }

  const peerConnections = selectPeerConnections(state);
  const latency = peerConnections[userId]?.latency ?? 0;
  const delay = maxLatency - latency;
  if (delay < MIN_LATENCY_CUTOFF_MS) {
    // ignore imperceptible delay
    return;
  }

  return delay;
}
