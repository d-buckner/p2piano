import Instrument from './Instrument';
import { PolySynth, Synth as ToneSynth } from 'tone';
import { toFrequency } from '../lib/NoteHelpers';


export default class Synth extends Instrument {
  private instrument: PolySynth;

  constructor() {
    super();
    this.instrument = new PolySynth(ToneSynth, {
      oscillator: {
        type: 'square',
      },
      envelope: {
        decay: 1,
        release: 1
      },
      volume: -20,
    });
    this.instrument.toDestination();
  }

  keyDown(midi: number, velocity = 100) {
    this.instrument.triggerAttack(
      toFrequency(midi),
      undefined,
      velocity / 127,
    );
  }

  keyUp(midi: number) {
    this.instrument.triggerRelease(toFrequency(midi));
  }

  releaseAll() {
    this.instrument.releaseAll();
  }
}
