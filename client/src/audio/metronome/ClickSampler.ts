import Logger from '../../lib/Logger';
import getDelayTime from '../instruments/getDelayTime';
import type { Sampler as ISampler } from 'tone';


class ClickSampler {
  private static sampler: ISampler | undefined;
  private static HI_NOTE = 'C4';
  private static LOW_NOTE = 'C3';

  private constructor() { }

  static async initialize() {
    if (this.sampler) return;

    const { Sampler } = await import('tone');
    this.sampler = new Sampler({
      urls: {
        [ClickSampler.HI_NOTE]: 'hi.ogg',
        [ClickSampler.LOW_NOTE]: 'low.ogg',
      },
      baseUrl: '/assets/samples/metronome/',
    }).toDestination();
  }

  static high(delay?: number) {
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

  static low(delay?: number) {
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

  static scheduleHigh(time: number) {
    if (!this.sampler || !this.sampler.loaded) {
      Logger.WARN('ClickSampler not initialized or samples not loaded');
      return;
    }
    this.sampler.triggerAttackRelease(
      ClickSampler.HI_NOTE,
      '8n',
      time,
    );
  }

  static scheduleLow(time: number) {
    if (!this.sampler || !this.sampler.loaded) {
      Logger.WARN('ClickSampler not initialized or samples not loaded');
      return;
    }
    this.sampler.triggerAttackRelease(
      ClickSampler.LOW_NOTE,
      '8n',
      time,
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
