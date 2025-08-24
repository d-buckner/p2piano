import { getTransport } from 'tone';
import { KeyActions } from '../../constants';
import { NoteManager } from '../../lib/NoteManager';
import getDelayTime from '../instruments/getDelayTime';
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
  private scheduledEvents: number[] = [];

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

    // Start Tone.js Transport for scheduled events
    getTransport().start();

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

    const transport = getTransport();
    
    // Clear all scheduled visualization events
    this.scheduledEvents.forEach(eventId => transport.clear(eventId));
    this.scheduledEvents = [];

    // Stop Tone.js Transport
    transport.stop();
  }

  getState() {
    return { ...this.state };
  }

  private scheduleEvent(event: RecordingEvent) {
    const instrument = InstrumentRegistry.get(event.userId);
    if (!instrument) return;

    const timeString = getDelayTime(event.timestamp);

    switch (event.type) {
      case KeyActions.KEY_DOWN: {
        instrument.keyDown(event.midi, event.timestamp, event.velocity);
        // Schedule visualization event with Tone.js Transport
        const startEventId = getTransport().schedule(() => {
          if (this.state.isPlaying && !this.state.isPaused) {
            NoteManager.startNote(event.midi, event.userId, event.color);
          }
        }, timeString);
        this.scheduledEvents.push(startEventId);
        break;
      }
      case KeyActions.KEY_UP: {
        instrument.keyUp(event.midi, event.timestamp);
        // Schedule visualization event with Tone.js Transport
        const endEventId = getTransport().schedule(() => {
          if (this.state.isPlaying && !this.state.isPaused) {
            NoteManager.endNote(event.midi, event.userId);
          }
        }, timeString);
        this.scheduledEvents.push(endEventId);
        break;
      }
      case KeyActions.SUSTAIN_DOWN:
        instrument.sustainDown?.(event.timestamp);
        break;
      case KeyActions.SUSTAIN_UP:
        instrument.sustainUp?.(event.timestamp);
        break;
    }
  }
}
