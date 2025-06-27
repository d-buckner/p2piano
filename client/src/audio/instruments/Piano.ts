import { Piano as DPiano } from 'd-piano';
import { DEFAULT_VELOCITY } from '../../constants';
import Logger from '../../lib/Logger';
import { audioCacheManager } from '../AudioCacheManager';
import getDelayTime from './getDelayTime';
import type { Instrument } from './Instrument';


const URL = '/assets/samples/piano/'

export default class Piano implements Instrument {
  private static MIN_VELOCITIES = 2;
  private static MAX_VELOCITIES = 16;
  private loadStart = Date.now();
  private instrument?: DPiano;
  private velocities: number = Piano.MIN_VELOCITIES;
  private onIdle: (() => void) | null = null;
  private activeKeys: Set<number> = new Set();


  constructor() {
    this.load = this.load.bind(this);
    this.load();
  }

  public keyDown(midi: number, delay?: number, velocity = DEFAULT_VELOCITY): void {
    this.instrument?.keyDown({
      note: midi.toString(),
      time: getDelayTime(delay),
      velocity: velocity / 127,
    });
    this.activeKeys.add(midi);
  }

  public keyUp(midi: number, delay?: number): void {
    this.instrument?.keyUp({
      note: midi.toString(),
      time: getDelayTime(delay),
    });
    this.activeKeys.delete(midi);
    if (!this.activeKeys.size) {
      this.onIdle?.();
    }
  }

  public releaseAll() {
    this.instrument?.stopAll();
  }

  // everything below here is for the progressive sample streaming
  // TODO: generalize this implementation so it can be used by any old sampler


  private async load(): Promise<void> {
    this.onIdle = null;
    if (this.velocities > Piano.MAX_VELOCITIES) {
      Logger.DEBUG(
        'audio: full piano samples loaded in',
        this.getSecondsFromLoad(),
        'seconds'
      );
      return;
    }

    const instrument = new DPiano({
      url: URL,
      velocities: this.velocities,
    });
    
    Logger.DEBUG(`Piano: Loading velocity layer ${this.velocities}`);
    await instrument.load();
    Logger.DEBUG(`Piano: Loaded velocity layer ${this.velocities}`);
    if (this.velocities === Piano.MIN_VELOCITIES) {
      Logger.DEBUG(
        'audio: initial piano samples loaded in',
        this.getSecondsFromLoad(),
        'seconds'
      );
    }
    
    // After loading current layer, prefetch the NEXT layer in background
    this.velocities *= 2;
    this.prefetchNextLayer();
    
    if (this.activeKeys.size) {
      // active note(s), queue the swap for when there's nothing playing to avoid impacting current audio
      this.onIdle = () => this.swapInstrument(instrument);
      return;
    }

    // piano isn't active, time to swap it some sweet new velocity samples
    this.swapInstrument(instrument);
  }

  private async prefetchNextLayer(): Promise<void> {
    try {
      if (audioCacheManager.isReady()) {
        // Prefetch the NEXT layer (which will be this.velocities * 2)
        if (this.velocities <= Piano.MAX_VELOCITIES) {
          Logger.DEBUG(`Piano: Prefetching velocity layer ${this.velocities} in background`);
          await audioCacheManager.prefetchNextVelocityLayer(URL, this.velocities);
        }
      }
    } catch (error) {
      Logger.WARN('Piano: Failed to prefetch next velocity layer:', error);
    }
  }

  private swapInstrument(instrument: DPiano) {
    // stop any ringing in the existing piano
    this.instrument?.stopAll();
    // make the swap, let the old instrument be garbage collected
    this.instrument = instrument.toDestination();
    this.load();
  }

  private getSecondsFromLoad(): number {
    return (Date.now() - this.loadStart) / 1000;
  }
}
