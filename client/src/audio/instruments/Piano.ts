import { Piano as DPiano } from 'd-piano';
import { DEFAULT_VELOCITY } from '../../constants';
import Logger from '../../lib/Logger';
import { requestIdleCallback } from '../../lib/ponyfill';
import getDelayTime from './getDelayTime';
import { InstrumentType, type Instrument } from './Instrument';


const VOLUME = -3;
const URL = '/assets/samples/piano/';

export default class Piano implements Instrument {
  public readonly type = InstrumentType.PIANO;
  private static readonly velocityProgression: number[] = [1, 8];
  private loadStart = Date.now();
  private instrument?: DPiano;
  private velocityIndex: number = 0;
  private onIdle: (() => void) | null = null;
  private activeKeys: Set<number> = new Set();
  private sustainedKeys: Set<number> = new Set();
  private isSustained = false;


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
    if (this.isSustained) {
      this.sustainedKeys.add(midi);
    }
  }

  public keyUp(midi: number, delay?: number): void {
    this.instrument?.keyUp({
      note: midi.toString(),
      time: getDelayTime(delay),
    });
    this.activeKeys.delete(midi);
    if (!this.isActive()) {
      this.onIdle?.();
    }
  }

  public sustainDown(): void {
    this.instrument?.pedalDown();
    this.isSustained = true;
  }

  public sustainUp(): void {
    this.instrument?.pedalUp();
    this.isSustained = false;
    this.sustainedKeys.clear();
    if (!this.isActive()) {
      this.onIdle?.();
    }
  }

  public releaseAll() {
    this.instrument?.stopAll();
  }

  private isActive(): boolean {
    return this.activeKeys.size > 0 || this.sustainedKeys.size > 0;
  }

  // everything below here is for the progressive sample streaming


  private async load(): Promise<void> {
    this.onIdle = null;
    const velocities = Piano.velocityProgression[this.velocityIndex];
    if (this.velocityIndex === Piano.velocityProgression.length) {
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
      volume: {
        pedal: VOLUME,
        strings: VOLUME,
        keybed: VOLUME,
        harmonics: VOLUME,
      }
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

    if (this.isActive()) {
      // active note(s), queue the swap for when there's nothing playing to avoid impacting current audio
      this.onIdle = () => this.swapInstrument(instrument);
      return;
    }

    // piano isn't active, time to swap it some sweet new velocity samples
    this.swapInstrument(instrument);
  }

  private swapInstrument(instrument: DPiano) {
    // stop any ringing in the existing piano
    const existingInstrument = this.instrument;
    // let old piano ring fully before queing cleanup during idle
    setTimeout(() => requestIdleCallback(() => {
      existingInstrument?.dispose();
    }), 1000);
    // make the swap, let the old instrument be garbage collected
    this.instrument = instrument.toDestination();
    this.velocityIndex++;

    // Load next layer when browser is idle to prevent freezing with multiple users
    requestIdleCallback(() => {
      // Start async loading without blocking the idle callback
      this.load().catch(error => {
        Logger.ERROR('Piano sample loading failed:', error);
      });
    });
  }

  private getSecondsFromLoad(): number {
    return (Date.now() - this.loadStart) / 1000;
  }
}
