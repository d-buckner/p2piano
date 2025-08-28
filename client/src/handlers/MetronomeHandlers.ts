import { store } from '../app/store';
import ClickSampler from '../audio/metronome/ClickSampler';
import { getAudioDelay } from '../audio/synchronization/utils';
import { TICK_TYPE, type TickType } from '../constants/metronome';
import { appContainer } from '../core/AppContainer';
import { ServiceTokens } from '../core/ServiceTokens';
import { selectMyUser } from '../selectors/workspaceSelectors';


type TickPayload = {
  type: TickType;
  userId?: string;
};

export default class MetronomeHandlers {
  private constructor() { }

  public static tickHandler(payload: TickPayload) {
    const { type, userId } = payload;
    
    // Don't play our own ticks (we're the leader sending them)
    const myUserId = selectMyUser(store)?.userId;
    if (userId === myUserId) return;
    
    const audioEngine = appContainer.resolve(ServiceTokens.AudioEngine);
    if (!audioEngine.isReady() || !userId) return;
    
    // Calculate delay for synchronized playback
    const delay = getAudioDelay(userId);
    
    if (type === TICK_TYPE.HI) {
      ClickSampler.high(delay);
    } else {
      ClickSampler.low(delay);
    }
  }
}
