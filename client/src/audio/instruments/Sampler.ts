import { Sampler as ToneSampler } from 'tone';
import { toFrequency } from '../../lib/NoteHelpers';
import getDelayTime from './getDelayTime';

import type { Instrument } from './Instrument';


const BASE_PATH = '/assets/samples/';
const FILE_TYPE = 'mp3';

export default class Sampler implements Instrument {
  protected instrument: ToneSampler;

  constructor(baseName: string, notenames: string[]) {
    this.instrument = new ToneSampler({
      urls: getUrls(notenames),
      baseUrl: `${BASE_PATH}${baseName}/`,
    });
    this.instrument.toDestination();
  }

  keyDown(midi: number, delay?: number, velocity = 100) {
    this.instrument.triggerAttack(
      toFrequency(midi),
      getDelayTime(delay),
      velocity / 127
    );
  }

  keyUp(midi: number, delay?: number) {
    this.instrument.triggerRelease(toFrequency(midi), getDelayTime(delay));
  }

  releaseAll() {
    this.instrument.releaseAll();
  }
}

function getUrls(notenames: string[]): Record<string, string> {
  return notenames.reduce((acc, notename) => {
    acc[notename] = `${notename}.${FILE_TYPE}`;
    return acc;
  }, {} as Record<string, string>);
}
