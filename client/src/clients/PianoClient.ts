import WebRtcController from '../networking/transports/WebRtcController';


const KEY_ACTIONS = {
  KEY_DOWN: 'KEY_DOWN',
  KEY_UP: 'KEY_UP',
} as const;

const PianoClient = {
  keyDown(midi: number, velocity: number) {
    WebRtcController.getInstance().broadcast(KEY_ACTIONS.KEY_DOWN, { midi, velocity });
  },

  keyUp(midi: number) {
    WebRtcController.getInstance().broadcast(KEY_ACTIONS.KEY_UP, { midi });
  },
};

export default PianoClient;
