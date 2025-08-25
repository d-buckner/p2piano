import { createStore } from 'solid-js/store';
import type { RecordingMetadata } from '../audio/recording/types';


export enum PlaybackStatus {
  STOPPED = 'stopped',
  PLAYING = 'playing',
  PAUSED = 'paused'
}

export type RecordingState = {
  recordings: RecordingMetadata[];
  isLoaded: boolean;
  isRecording: boolean;
  currentRecordingId?: string;
  recordingStartTime: number;
  
  // Playback state
  selectedRecordingId?: string;
  playbackStatus: PlaybackStatus;
  playbackTimestamp: number;
  playbackDuration?: number;
};

const initialRecordingState: RecordingState = {
  recordings: [],
  isLoaded: false,
  isRecording: false,
  currentRecordingId: undefined,
  recordingStartTime: 0,
  
  // Playback state
  selectedRecordingId: undefined,
  playbackStatus: PlaybackStatus.STOPPED,
  playbackTimestamp: 0,
  playbackDuration: undefined,
};

export const [recordingStore, setRecordingStore] = createStore<RecordingState>(initialRecordingState);
