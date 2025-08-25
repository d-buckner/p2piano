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
  isComplete: boolean;
}

export default class Playback {
  private state: PlaybackState = {
    isPlaying: false,
    isPaused: false,
    currentPosition: 0,
    startTime: 0,
    isStreaming: false,
    isComplete: false
  };

  private readonly LOOKAHEAD_MS = 100;
  private streamInterval?: NodeJS.Timeout;
  private scheduledEvents: number[] = [];
  private onComplete?: () => void;
  private activeUserIds = new Set<string>();

  private constructor(private client: RecordingClient) {
    this.scheduleEvent = this.scheduleEvent.bind(this);
  }

  static async load(recordingId: string, onComplete?: () => void) {
    const client = new RecordingClient(recordingId);
    await client.initialize();
    const playback = new Playback(client);
    playback.onComplete = onComplete;
    return playback;
  }

  async start() {
    if (this.state.isPlaying) return;

    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.state.isComplete = false;
    this.state.startTime = performance.now();
    this.state.lastStreamedTimestamp = undefined;
    
    // Clear previous playback state
    this.activeUserIds.clear();

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
        if (!hasMore && !this.state.isComplete) {
          this.handlePlaybackComplete();
        }
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
    this.streamInterval = setInterval(async () => {
      if (!this.state.isPlaying || this.state.isPaused || this.state.isComplete) return;

      const currentTime = performance.now() - this.state.startTime;
      const needsMoreEvents = this.state.lastEventTimestamp &&
        (currentTime + this.LOOKAHEAD_MS >= this.state.lastEventTimestamp);

      if (needsMoreEvents && !this.state.isStreaming) {
        const hasMore = await this.loadAndScheduleNextBatch();
        if (!hasMore && this.state.lastEventTimestamp && 
            currentTime >= this.state.lastEventTimestamp && !this.state.isComplete) {
          this.handlePlaybackComplete();
        }
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
    this.state.isComplete = false;

    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = undefined;
    }

    const transport = getTransport();
    
    // Clear all scheduled visualization events
    this.scheduledEvents.forEach(eventId => transport.clear(eventId));
    this.scheduledEvents = [];

    // Release all active notes from recording playback
    this.releaseAllActiveNotes();

    // Stop Tone.js Transport
    transport.stop();
  }

  private handlePlaybackComplete() {
    this.state.isComplete = true;
    this.state.isPlaying = false;
    
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = undefined;
    }
    
    // Release any notes that might still be active when playback ends
    this.releaseAllActiveNotes();
    
    if (this.onComplete) {
      this.onComplete();
    }
  }

  getState() {
    return { ...this.state };
  }

  private releaseAllActiveNotes() {
    // Release all notes for users encountered during playback
    this.activeUserIds.forEach(userId => {
      // Release all notes in NoteManager for this user
      NoteManager.releaseAllNotesForUser(userId);
      
      // Also release all notes in the instrument
      const instrument = InstrumentRegistry.get(userId);
      if (instrument) {
        instrument.releaseAll();
      }
    });
  }

  private scheduleEvent(event: RecordingEvent) {
    const instrument = InstrumentRegistry.get(event.userId);
    if (!instrument) return;

    // Track user IDs for cleanup
    this.activeUserIds.add(event.userId);

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
