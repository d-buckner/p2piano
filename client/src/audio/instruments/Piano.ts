import { Piano as TonePiano } from 'd-piano';
import { DEFAULT_VELOCITY } from '../../constants';
import getDelayTime from './getDelayTime';
import type { Instrument } from './Instrument';


export default class Piano implements Instrument {
  private instrument: TonePiano;

  constructor() {
    this.instrument = new TonePiano({
      velocities: 16,
      url: '/assets/samples/piano/'
    });
    this.instrument.load();
    this.instrument.toDestination();
  }

  keyDown(midi: number, delay?: number, velocity = DEFAULT_VELOCITY): void {
    this.instrument.keyDown({
      note: midi.toString(),
      time: getDelayTime(delay),
      velocity: velocity / 127,
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
