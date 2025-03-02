import Instrument from './Instrument';
import { Piano as TonePiano } from '@tonejs/piano';

export default class Piano extends Instrument {
  private instrument: TonePiano;

  constructor() {
    super();
    this.instrument = new TonePiano({ velocities: 1 });
    this.instrument.load();
    this.instrument.toDestination();
  }

  keyDown(midi: number, velocity = 100): void {
    this.instrument.keyDown({
      note: midi.toString(),
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