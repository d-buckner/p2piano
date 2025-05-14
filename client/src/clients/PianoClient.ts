import WebRtcController from '../controllers/WebRtcController';
import WebsocketController from '../controllers/WebsocketController';

import type { Payload } from '../constants';


const KEY_ACTIONS = {
  KEY_DOWN: 'KEY_DOWN',
  KEY_UP: 'KEY_UP',
} as const;

const PianoClient = {
  // TODO: Move subscriptions to RoomActionBridge
  onKeyDown(callback: (payload: Payload) => void) {
    WebRtcController.getInstance().on(KEY_ACTIONS.KEY_DOWN, callback);
    WebsocketController.getInstance().on(KEY_ACTIONS.KEY_DOWN, callback);
  },

  // TODO: Move subscriptions to RoomActionBridge
  onKeyUp(callback: (payload: Payload) => void) {
    WebRtcController.getInstance().on(KEY_ACTIONS.KEY_UP, callback);
    WebsocketController.getInstance().on(KEY_ACTIONS.KEY_UP, callback);
  },

  keyDown(midi: number, velocity: number) {
    WebRtcController.getInstance().broadcast(KEY_ACTIONS.KEY_DOWN, { midi, velocity });
  },

  keyUp(midi: number) {
    WebRtcController.getInstance().broadcast(KEY_ACTIONS.KEY_UP, { midi });
  },
};

export default PianoClient;
