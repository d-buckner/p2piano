import Instrument from './Instrument';
import { Sampler as ToneSampler } from 'tone';
import { toFrequency } from '../lib/NoteHelpers';

const BASE_PATH = '/assets/samples/';
const FILE_TYPE = 'mp3';

export default class Sampler extends Instrument {
  protected instrument: ToneSampler;

  constructor(baseName: string, notenames: string[]) {
    super();
    this.instrument = new ToneSampler({
      urls: getUrls(notenames),
      baseUrl: `${BASE_PATH}${baseName}/`,
    });
    this.instrument.toDestination();
  }

  keyDown(midi: number, velocity = 100) {
    this.instrument.triggerAttack(
      toFrequency(midi),
      undefined,
      velocity / 127
    );
  }

  keyUp(midi: number) {
    this.instrument.triggerRelease(toFrequency(midi));
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
