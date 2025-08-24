import { store } from '../app/store';
import RecordingClient from '../audio/recording/RecordingClient';
import { selectRecordingStartTime } from '../selectors/recordingSelectors';
import { setRecordingStore } from '../stores/RecordingStore';
import type { InstrumentType } from '../audio/instruments/Instrument';
import type { Note } from '../constants';


const Attributes = {
  RECORDINGS: 'recordings',
  IS_LOADED: 'isLoaded',
  IS_RECORDING: 'isRecording',
  CURRENT_RECORDING_ID: 'currentRecordingId',
  RECORDING_START_TIME: 'recordingStartTime',
} as const;

let recordingClient: RecordingClient | undefined;

export async function loadUserRecordings() {
  const recordings = await RecordingClient.getUserRecordings();
  setRecordingStore(Attributes.RECORDINGS, recordings);
  setRecordingStore(Attributes.IS_LOADED, true);
}

export async function startRecording() {
  const recordingId = crypto.randomUUID();
  const startTime = Math.floor(performance.now());

  setRecordingStore(Attributes.IS_RECORDING, true);
  setRecordingStore(Attributes.CURRENT_RECORDING_ID, recordingId);
  setRecordingStore(Attributes.RECORDING_START_TIME, startTime);

  recordingClient = new RecordingClient(recordingId);
  await recordingClient.initialize();
  
  // Reload recordings to include the new one
  await loadUserRecordings();
}

export function stopRecording() {
  recordingClient?.close();
  recordingClient = undefined;

  setRecordingStore(Attributes.IS_RECORDING, false);
  setRecordingStore(Attributes.CURRENT_RECORDING_ID, undefined);
  setRecordingStore(Attributes.RECORDING_START_TIME, 0);
}

export function recordKeyDown(note: Note, instrument: InstrumentType, audioDelay?: number) {
  if (!recordingClient) {
    throw new Error('Cannot record before recording client is initialized');
  }
  recordingClient.keyDown(note, instrument, getTimestamp(audioDelay));
}

export function recordKeyUp(midi: number, userId: string, audioDelay?: number) {
  if (!recordingClient) {
    throw new Error('Cannot record before recording client is initialized');
  }
  recordingClient.keyUp(midi, userId, getTimestamp(audioDelay));
}

export function recordSustainDown(userId: string) {
  if (!recordingClient) {
    throw new Error('Cannot record before recording client is initialized');
  }
  recordingClient.sustainDown(userId, getTimestamp());
}

export function recordSustainUp(userId: string) {
  if (!recordingClient) {
    throw new Error('Cannot record before recording client is initialized');
  }
  recordingClient.sustainUp(userId, getTimestamp());
}

function getTimestamp(audioDelay = 0): number {
  return Math.floor(performance.now() - selectRecordingStartTime(store) + audioDelay);
}
