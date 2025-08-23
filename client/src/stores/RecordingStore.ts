import { createStore } from 'solid-js/store';
import type { RecordingMetadata } from '../audio/recording/types';

export type RecordingState = {
  recordings: RecordingMetadata[];
  isLoaded: boolean;
  isRecording: boolean;
  currentRecordingId?: string;
  recordingStartTime: number;
};

const initialRecordingState: RecordingState = {
  recordings: [],
  isLoaded: false,
  isRecording: false,
  currentRecordingId: undefined,
  recordingStartTime: 0,
};

export const [recordingStore, setRecordingStore] = createStore<RecordingState>(initialRecordingState);