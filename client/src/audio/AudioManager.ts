import type * as Tone from 'tone';


enum AudioManagerState {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  STARTING = 'starting',
}

export default class AudioManager {
  private static state: AudioManagerState = AudioManagerState.INACTIVE;
  private static activeCallbacks: (() => void)[] = [];
  private static tone: typeof Tone | null = null;
  private constructor() { }

  public static async activate() {
    if (AudioManager.state !== AudioManagerState.INACTIVE) {
      return;
    }

    AudioManager.state = AudioManagerState.STARTING;
    AudioManager.tone = await import('tone');
    AudioManager.tone.setContext(new AudioManager.tone.Context({
      latencyHint: 'interactive',
      lookAhead: 0,
    }));
    await AudioManager.tone.start();
    AudioManager.state = AudioManagerState.ACTIVE;

    AudioManager.activeCallbacks.forEach(cb => cb());
    AudioManager.activeCallbacks = [];
  }

  public static get active() {
    return AudioManager.state === AudioManagerState.ACTIVE;
  }

  public static whenActive(callback: () => void) {
    if (AudioManager.state === AudioManagerState.ACTIVE) {
      callback();
      return;
    }

    AudioManager.activeCallbacks.push(callback);
  }

  public static setVolume(volume: number) {
    if (!AudioManager.active || !AudioManager.tone) return;
    
    // Convert 0-1 range to decibels using logarithmic scale
    const dbVolume = volume === 0 ? -60 : 20 * Math.log10(volume);
    AudioManager.tone.getDestination().volume.value = dbVolume;
  }

  public static mute() {
    if (!AudioManager.active || !AudioManager.tone) return;
    
    AudioManager.tone.getDestination().mute = true;
  }

  public static unmute() {
    if (!AudioManager.active || !AudioManager.tone) return;
    
    AudioManager.tone.getDestination().mute = false;
  }

  public static destroy() {
    AudioManager.state = AudioManagerState.INACTIVE;
    AudioManager.activeCallbacks = [];
    AudioManager.tone = null;
  }
};
