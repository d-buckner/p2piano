import RealTimeController from '../networking/RealTimeController';


const KEY_ACTIONS = {
  KEY_DOWN: 'KEY_DOWN',
  KEY_UP: 'KEY_UP',
} as const;

const PianoClient = {
  keyDown(note: number, velocity: number) {
    RealTimeController.getInstance().broadcast(KEY_ACTIONS.KEY_DOWN, { note, velocity });
  },

  keyUp(note: number) {
    RealTimeController.getInstance().broadcast(KEY_ACTIONS.KEY_UP, { note });
  },
};

export default PianoClient;
