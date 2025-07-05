import { setStore } from '../app/store';
import { MIN_BPM, MAX_BPM } from '../constants/metronome';


export function setMetronomeActive(active: boolean) {
  setStore('metronome', 'active', active);
}

export function setMetronomeBpm(bpm: number) {
  const validBpm = Math.max(MIN_BPM, Math.min(MAX_BPM, bpm));
  setStore('metronome', 'bpm', validBpm);
}

export function setMetronomeLeader(leaderId?: string) {
  setStore('metronome', 'leaderId', leaderId);
}
