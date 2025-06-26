import { store } from '../../app/store';
import { selectMaxLatency, selectPeerConnections } from '../../slices/connectionSlice';
import { selectWorkspace } from '../../slices/workspaceSlice';
import { MIN_LATENCY_CUTOFF_MS } from './constants';


export function getAudioDelay(userId: string): number | undefined {
  const workspace = selectWorkspace(store);
  const maxLatency = selectMaxLatency(store);
  if (userId === workspace.userId) {
    return maxLatency;
  }

  const peerConnections = selectPeerConnections(store);
  const latency = peerConnections[userId]?.latency ?? 0;
  const delay = maxLatency - latency;
  if (delay < MIN_LATENCY_CUTOFF_MS) {
    // ignore imperceptible delay
    return;
  }

  return delay;
}
