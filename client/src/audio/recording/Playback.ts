import { KeyActions } from '../../constants';
import InstrumentRegistry from '../instruments/InstrumentRegistry';
import RecordingClient from './RecordingClient';


interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentPosition: number;
  startTime: number;
}

export default class Playback {
  private state: PlaybackState = {
    isPlaying: false,
    isPaused: false,
    currentPosition: 0,
    startTime: 0
  };

  private constructor(private client: RecordingClient) {}

  static async load(recordingId: string) {
    const client = new RecordingClient(recordingId);
    await client.initialize();
    return new Playback(client);
  }

  async start() {
    if (this.state.isPlaying) return;

    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.state.startTime = performance.now();

    const batch = await this.client.getNextEventBatch();
    if (batch.length === 0) return;

    batch.forEach(event => {
      if (event.type !== KeyActions.KEY_DOWN && event.type !== KeyActions.KEY_UP) {
        return;
      }

      const instrument = InstrumentRegistry.get(event.userId);
      if (!instrument) return;

      // event.timestamp is already the delay in ms from recording start
      // Pass it directly as the delay parameter
      switch (event.type) {
        case KeyActions.KEY_DOWN:
          instrument.keyDown(event.midi, event.timestamp, event.velocity);
          break;
        case KeyActions.KEY_UP:
          instrument.keyUp(event.midi, event.timestamp);
          break; 
      }
    });
  }

  pause() {
    this.state.isPaused = true;
  }

  resume() {
    this.state.isPaused = false;
  }

  stop() {
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentPosition = 0;
  }

  getState() {
    return { ...this.state };
  }
}
