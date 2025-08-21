import { KeyActions } from '../constants';
import RealTimeController from '../networking/RealTimeController';


const PianoClient = {
  keyDown(note: number, velocity: number) {
    RealTimeController.getInstance().broadcast(KeyActions.KEY_DOWN, { note, velocity });
  },

  keyUp(note: number) {
    RealTimeController.getInstance().broadcast(KeyActions.KEY_UP, { note });
  },

  sustainDown() {
    RealTimeController.getInstance().broadcast(KeyActions.SUSTAIN_DOWN);
  },

  sustainUp() {
    RealTimeController.getInstance().broadcast(KeyActions.SUSTAIN_UP);
  },
};

export default PianoClient;
