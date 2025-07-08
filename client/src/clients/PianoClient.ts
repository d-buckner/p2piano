import RealTimeController from '../networking/RealTimeController';


const KEY_ACTIONS = {
  KEY_DOWN: 'KEY_DOWN',
  KEY_UP: 'KEY_UP',
  SUSTAIN_DOWN: 'SUSTAIN_DOWN',
  SUSTAIN_UP: 'SUSTAIN_UP',
} as const;

const PianoClient = {
  keyDown(note: number, velocity: number) {
    RealTimeController.getInstance().broadcast(KEY_ACTIONS.KEY_DOWN, { note, velocity });
  },

  keyUp(note: number) {
    RealTimeController.getInstance().broadcast(KEY_ACTIONS.KEY_UP, { note });
  },

  sustainDown() {
    RealTimeController.getInstance().broadcast(KEY_ACTIONS.SUSTAIN_DOWN);
  },

  sustainUp() {
    RealTimeController.getInstance().broadcast(KEY_ACTIONS.SUSTAIN_UP);
  },
};

export default PianoClient;
