import { Sampler } from 'tone';
import Logger from '../../lib/Logger';
import getDelayTime from '../instruments/getDelayTime';


class ClickSampler {
  private static sampler: Sampler | undefined;
  private static HI_NOTE = 'C4';
  private static LOW_NOTE = 'C3';

  private constructor() { }

  static async initialize() {
    if (this.sampler) return;

    this.sampler = new Sampler({
      urls: {
        [ClickSampler.HI_NOTE]: 'hi.ogg',
        [ClickSampler.LOW_NOTE]: 'low.ogg',
      },
      baseUrl: '/assets/samples/metronome/',
    }).toDestination();
    this.sampler.debug = true;
  }

  static high(delay: number) {
    if (!this.sampler || !this.sampler.loaded) {
      Logger.WARN('ClickSampler not initialized or samples not loaded');
      return;
    }
    this.sampler.triggerAttackRelease(
      ClickSampler.HI_NOTE,
      '8n',
      getDelayTime(delay),
    );
  }

  static low(delay: number) {
    if (!this.sampler || !this.sampler.loaded) {
      Logger.WARN('ClickSampler not initialized or samples not loaded');
      return;
    }
    this.sampler.triggerAttackRelease(
      ClickSampler.LOW_NOTE,
      '8n',
      getDelayTime(delay),
    );
  }

  static dispose() {
    if (this.sampler) {
      this.sampler.dispose();
      this.sampler = undefined;
    }
  }
}

export default ClickSampler;