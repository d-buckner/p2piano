import { Piano as DPiano } from 'd-piano';
import { DEFAULT_VELOCITY } from '../../constants';
import Logger from '../../lib/Logger';
import getDelayTime from './getDelayTime';
import type { Instrument } from './Instrument';


const URL = '/assets/samples/piano/'

export default class Piano implements Instrument {
  private static readonly velocityOptions: number[] = [2, 8, 16];
  private loadStart = Date.now();
  private instrument?: DPiano;
  private velocityIndex: number = 0;
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
    const velocities = Piano.velocityOptions[this.velocityIndex];
    if (this.velocityIndex === Piano.velocityOptions.length) {
      Logger.DEBUG(
        'Piano: full samples loaded in',
        this.getSecondsFromLoad(),
        'seconds'
      );
      return;
    }

    const instrument = new DPiano({
      url: URL,
      velocities,
    });
    
    Logger.DEBUG(`Piano: Loading velocity layer ${velocities}`);
    await instrument.load();
    Logger.DEBUG(`Piano: Loaded velocity layer ${velocities}`);
    if (this.velocityIndex === 0) {
      Logger.DEBUG(
        'Piano: initial samples loaded in',
        this.getSecondsFromLoad(),
        'seconds'
      );
    }
    
    if (this.activeKeys.size) {
      // active note(s), queue the swap for when there's nothing playing to avoid impacting current audio
      this.onIdle = () => this.swapInstrument(instrument);
      return;
    }
    
    // piano isn't active, time to swap it some sweet new velocity samples
    this.swapInstrument(instrument);
  }
  
  private swapInstrument(instrument: DPiano) {
    // stop any ringing in the existing piano
    this.instrument?.stopAll();
    // make the swap, let the old instrument be garbage collected
    this.instrument = instrument.toDestination();
    this.velocityIndex++;
    
    // Load next layer when browser is idle to prevent freezing with multiple users
    requestIdleCallback(() => {
      // Start async loading without blocking the idle callback
      this.load().catch(error => {
        Logger.ERROR('Piano sample loading failed:', error);
      });
    }, { timeout: 5000 });
  }

  private getSecondsFromLoad(): number {
    return (Date.now() - this.loadStart) / 1000;
  }
}
