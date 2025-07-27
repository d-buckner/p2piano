import { store } from '../app/store';
import AudioManager from '../audio/AudioManager';
import ClickSampler from '../audio/metronome/ClickSampler';
import { getAudioDelay } from '../audio/syncronization/utils';
import { TICK_TYPE, type TickType } from '../constants/metronome';
import { selectMyUser } from '../selectors/workspaceSelectors';


type TickPayload = {
  type: TickType;
  userId?: string;
};

export default class MetronomeHandlers {
  private constructor() { }

  static tickHandler(payload: TickPayload) {
    const { type, userId } = payload;
    
    // Don't play our own ticks (we're the leader sending them)
    const myUserId = selectMyUser(store)?.userId;
    if (userId === myUserId) return;
    
    if (!AudioManager.active || !userId) return;
    
    // Calculate delay for synchronized playback
    const delay = getAudioDelay(userId);
    
    if (type === TICK_TYPE.HI) {
      ClickSampler.high(delay);
    } else {
      ClickSampler.low(delay);
    }
  }
}
