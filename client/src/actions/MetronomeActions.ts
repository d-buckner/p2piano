import { MIN_BPM, MAX_BPM } from '../constants/metronome';
import { SharedStoreActions } from '../crdt/store/SharedStoreActions';
import type { SharedStoreRoot } from '../crdt/store/SharedStoreRoot';
import type { SharedMetronomeState } from '../crdt/types/StoreTypes';

/**
 * CRDT-based metronome actions that synchronize metronome state across peers.
 * 
 * This class doesn't need to know about CRDT internals - it just uses the
 * change() method from SharedStoreActions to make modifications.
 */
export class MetronomeActions extends SharedStoreActions<SharedMetronomeState> {
  constructor(sharedRoot: SharedStoreRoot) {
    super('metronome', sharedRoot);
  }

  setActive(active: boolean) {
    this.change(metronome => {
      metronome.active = active;
      if (!active) {
        metronome.leaderId = '';
        metronome.startTimestamp = 0;
        metronome.currentBeat = 0;
      }
    });
  }

  start(userId: string) {
    this.change(metronome => {
      metronome.active = true;
      metronome.leaderId = userId;
      metronome.startTimestamp = Date.now();
      metronome.currentBeat = 0;
    });
  }

  stop() {
    this.change(metronome => {
      metronome.active = false;
      metronome.leaderId = '';
      metronome.startTimestamp = 0;
      metronome.currentBeat = 0;
    });
  }

  setBpm(bpm: number) {
    this.change(metronome => {
      metronome.bpm = Math.max(MIN_BPM, Math.min(MAX_BPM, bpm));
    });
  }

  setCurrentBeat(beat: number) {
    this.change(metronome => {
      metronome.currentBeat = beat;
    });
  }

  setBeatsPerMeasure(beats: number) {
    this.change(metronome => {
      metronome.beatsPerMeasure = beats;
      // Reset current beat when changing time signature
      metronome.currentBeat = 0;
    });
  }
}
