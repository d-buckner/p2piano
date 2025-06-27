import { Piano as DPiano } from 'd-piano';
import { DEFAULT_VELOCITY } from '../../constants';
import getDelayTime from './getDelayTime';
import type { Instrument } from './Instrument';


const URL = '/assets/samples/piano/'


export default class Piano implements Instrument {
  private static MIN_VELOCITIES = 2;
  private static MAX_VELOCITIES = 16;
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

  private next(callback: () => void) {
    if (!this.activeKeys.size) {
      callback();
      return;
    }

    this.onIdle = callback;
  }

  private async load(): Promise<void> {
    this.onIdle = null;
    if (this.velocities > Piano.MAX_VELOCITIES) {
      return;
    }

    const instrument = new DPiano({
      url: URL,
      velocities: this.velocities,
    });
    await instrument.load();
    this.velocities *= 4;

    if (this.activeKeys.size) {
      // active note(s), queue the swap for when there's nothing playing to avoid impacting current audio
      this.next(() => this.swap(instrument));
      return;
    }

    // piano isn't active, time to swap it some sweet new velocity samples
    this.swap(instrument);
  }

  private swap(instrument: DPiano) {
    // stop any ringing in the existing piano
    this.instrument?.stopAll();
    // make the swap, let the old instrument be garbage collected
    this.instrument = instrument.toDestination();
    this.load();
  }
}
