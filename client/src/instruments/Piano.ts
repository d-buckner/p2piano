import getDelayTime from './getDelayTime';
import type {Instrument} from './Instrument';
import { Piano as TonePiano } from '@tonejs/piano';

export default class Piano implements Instrument {
  private instrument: TonePiano;

  constructor() {
    this.instrument = new TonePiano({ velocities: 1 });
    this.instrument.load();
    this.instrument.toDestination();
  }

  keyDown(midi: number, delay = 0, velocity = 100): void {
    this.instrument.keyDown({
      note: midi.toString(),
      time: getDelayTime(delay),
      velocity: velocity / 127,
    });
  }

  keyUp(midi: number): void {
    this.instrument.keyUp({ note: midi.toString() });
  }

  releaseAll() {
    this.instrument.stopAll();
  }
}