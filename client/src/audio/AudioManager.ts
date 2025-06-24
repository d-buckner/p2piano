enum AudioManagerState {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  STARTING = 'starting',
}

export default class AudioManager {
  private static state: AudioManagerState = AudioManagerState.INACTIVE;
  private static activeCallbacks: (() => void)[] = [];
  private constructor() { }

  public static async activate() {
    if (AudioManager.state !== AudioManagerState.INACTIVE) {
      return;
    }

    AudioManager.state = AudioManagerState.STARTING;
    const Tone = await import('tone');
    Tone.setContext(new Tone.Context({
      latencyHint: 'interactive',
      lookAhead: 0,
    }));
    await Tone.start();
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
};
