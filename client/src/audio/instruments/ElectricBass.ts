import { InstrumentType, type Instrument } from './Instrument';
import Sampler from './Sampler';


const MIDI_OFFSET = -24;

export default class ElectricBass extends Sampler implements Instrument {
  public readonly type = InstrumentType.ELECTRIC_BASS;
  constructor() {
    super('bass-electric', [
      'G2',
      'E3',
      'G3',
      'E4',
      'G4',
    ]);
  }

  public keyDown(midi: number, delay?: number, velocity?: number) {
    super.keyDown(midi + MIDI_OFFSET, delay, velocity);
  }

  public keyUp(midi: number, delay?: number) {
    super.keyUp(midi + MIDI_OFFSET, delay);
  }
}
