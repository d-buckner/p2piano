import RealTimeController from '../networking/RealTimeController';
import type { TickType } from '../constants/metronome';


const METRONOME_ACTIONS = {
  METRONOME_TICK: 'METRONOME_TICK',
  METRONOME_START: 'METRONOME_START',
  METRONOME_STOP: 'METRONOME_STOP',
  SET_BPM: 'SET_BPM',
} as const;

const MetronomeClient = {
  tick(type: TickType) {
    RealTimeController.getInstance().broadcast(METRONOME_ACTIONS.METRONOME_TICK, { type });
  },

  start() {
    RealTimeController.getInstance().broadcast(METRONOME_ACTIONS.METRONOME_START);
  },

  stop() {
    RealTimeController.getInstance().broadcast(METRONOME_ACTIONS.METRONOME_STOP);
  },

  setBpm(bpm: number) {
    RealTimeController.getInstance().broadcast(METRONOME_ACTIONS.SET_BPM, { bpm });
  },
};

export default MetronomeClient;