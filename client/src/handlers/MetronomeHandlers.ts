import { setMetronomeActive, setMetronomeBpm, setMetronomeLeader } from '../actions/MetronomeActions';
import { store } from '../app/store';
import AudioManager from '../audio/AudioManager';
import { getAudioDelay } from '../audio/syncronization/utils';
import { TICK_TYPE, type TickType } from '../constants/metronome';
import { selectMyUser } from '../selectors/workspaceSelectors';


type TickPayload = {
  type: TickType;
  userId?: string;
};

type BpmPayload = {
  bpm: number;
  userId?: string;
};

type StartPayload = {
  userId?: string;
};



export default class MetronomeHandlers {
  private constructor() { }

  static async tickHandler(payload: TickPayload) {
    const { type, userId } = payload;
    
    // Don't play our own ticks (we're the leader sending them)
    const myUserId = selectMyUser(store)?.userId;
    if (userId === myUserId) return;
    
    if (!AudioManager.active || !userId) return;
    
    // Lazy load ClickSampler when needed
    const { default: ClickSampler } = await import('../audio/metronome/ClickSampler');
    await ClickSampler.initialize();
    
    // Calculate delay for synchronized playback
    const delay = getAudioDelay(userId);
    
    if (type === TICK_TYPE.HI) {
      ClickSampler.high(delay);
    } else {
      ClickSampler.low(delay);
    }
  }

  static startHandler(payload: StartPayload) {
    // Follower receives start - set active and the sender as leader
    setMetronomeActive(true);
    setMetronomeLeader(payload.userId);
  }

  static stopHandler() {
    // Everyone stops when receiving stop message
    setMetronomeActive(false);
    setMetronomeLeader(undefined);
  }

  static bpmHandler(payload: BpmPayload) {
    const { bpm } = payload;
    setMetronomeBpm(bpm);
  }
}