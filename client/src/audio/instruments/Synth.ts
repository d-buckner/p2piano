import { PolySynth, Synth as ToneSynth } from 'tone';
import { toFrequency } from '../../lib/NoteHelpers';
import getDelayTime from './getDelayTime';

import type { Instrument } from './Instrument';
import { DEFAULT_VELOCITY } from '../../constants';


export default class Synth implements Instrument {
  private instrument: PolySynth;

  constructor() {
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

  keyDown(midi: number, delay?: number, velocity = DEFAULT_VELOCITY) {
    this.instrument.triggerAttack(
      toFrequency(midi),
      getDelayTime(delay),
      velocity / 127,
    );
  }

  keyUp(midi: number, delay?: number) {
    this.instrument.triggerRelease(
      toFrequency(midi),
      getDelayTime(delay)
    );
  }

  releaseAll() {
    this.instrument.releaseAll();
  }
}
