import RealTimeController from '../networking/RealTimeController';


const KEY_ACTIONS = {
  KEY_DOWN: 'KEY_DOWN',
  KEY_UP: 'KEY_UP',
} as const;

const PianoClient = {
  keyDown(midi: number, velocity: number) {
    RealTimeController.getInstance().broadcast(KEY_ACTIONS.KEY_DOWN, { midi, velocity });
  },

  keyUp(midi: number) {
    RealTimeController.getInstance().broadcast(KEY_ACTIONS.KEY_UP, { midi });
  },
};

export default PianoClient;
