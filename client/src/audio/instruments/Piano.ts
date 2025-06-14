import getDelayTime from './getDelayTime';
import { Piano as TonePiano } from '@tonejs/piano';

import type { Instrument } from './Instrument';


export default class Piano implements Instrument {
  private instrument: TonePiano;

  constructor() {
    this.instrument = new TonePiano({ velocities: 2 });
    this.instrument.load();
    this.instrument.toDestination();
  }

  keyDown(midi: number, delay?: number, velocity = 100): void {
    this.instrument.keyDown({
      note: midi.toString(),
      time: getDelayTime(delay),
      velocity: Math.floor(velocity / 127),
    });
  }

  keyUp(midi: number, delay?: number): void {
    this.instrument.keyUp({
      note: midi.toString(),
      time: getDelayTime(delay),
    });
  }

  releaseAll() {
    this.instrument.stopAll();
  }
}
