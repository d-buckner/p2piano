import { KeyActions } from '../../constants';
import InstrumentRegistry from '../instruments/InstrumentRegistry';
import RecordingClient from './RecordingClient';
import type { RecordingEvent } from './types';


interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentPosition: number;
  startTime: number;
  lastEventTimestamp?: number;
  lastStreamedTimestamp?: number;
  isStreaming: boolean;
}

export default class Playback {
  private state: PlaybackState = {
    isPlaying: false,
    isPaused: false,
    currentPosition: 0,
    startTime: 0,
    isStreaming: false
  };

  private readonly LOOKAHEAD_MS = 100;
  private streamInterval?: NodeJS.Timeout;

  private constructor(private client: RecordingClient) {
    this.scheduleEvent = this.scheduleEvent.bind(this);
  }

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
    this.state.lastStreamedTimestamp = undefined;

    await this.loadAndScheduleNextBatch();
    this.startLookaheadLoop();
  }

  private async loadAndScheduleNextBatch(): Promise<boolean> {
    if (this.state.isStreaming) return false;

    this.state.isStreaming = true;

    try {
      const result = await this.client.getEventsByRecording(100, this.state.lastStreamedTimestamp);
      const { events, hasMore } = result;

      if (events.length === 0) {
        this.state.isStreaming = false;
        return false;
      }

      events.forEach(this.scheduleEvent);

      this.state.lastEventTimestamp = events[events.length - 1]?.timestamp;
      this.state.lastStreamedTimestamp = this.state.lastEventTimestamp;
      this.state.isStreaming = false;

      return hasMore;
    } catch (error) {
      this.state.isStreaming = false;
      console.error('Failed to load event batch:', error);
      return false;
    }
  }

  private startLookaheadLoop() {
    this.streamInterval = setInterval(() => {
      if (!this.state.isPlaying || this.state.isPaused) return;

      const currentTime = performance.now() - this.state.startTime;
      const needsMoreEvents = this.state.lastEventTimestamp &&
        (currentTime + this.LOOKAHEAD_MS >= this.state.lastEventTimestamp);

      if (needsMoreEvents && !this.state.isStreaming) {
        this.loadAndScheduleNextBatch();
      }
    }, this.LOOKAHEAD_MS);
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
    this.state.lastEventTimestamp = undefined;
    this.state.lastStreamedTimestamp = undefined;

    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = undefined;
    }
  }

  getState() {
    return { ...this.state };
  }

  private scheduleEvent(event: RecordingEvent) {
    const instrument = InstrumentRegistry.get(event.userId);
    if (!instrument) return;

    switch (event.type) {
      case KeyActions.KEY_DOWN:
        instrument.keyDown(event.midi, event.timestamp, event.velocity);
        break;
      case KeyActions.KEY_UP:
        instrument.keyUp(event.midi, event.timestamp);
        break;
      case KeyActions.SUSTAIN_DOWN:
        instrument.sustainDown?.(event.timestamp);
        break;
      case KeyActions.SUSTAIN_UP:
        instrument.sustainUp?.(event.timestamp);
        break;
    }
  }
}
