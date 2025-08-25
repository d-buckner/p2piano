import { store } from '../app/store';
import RecordingClient from '../audio/recording/RecordingClient';
import Playback from '../audio/recording/Playback';
import { selectRecordingStartTime, selectRecordings, selectSelectedRecordingId, selectCurrentRecordingId } from '../selectors/recordingSelectors';
import { setRecordingStore, PlaybackStatus } from '../stores/RecordingStore';
import type { InstrumentType } from '../audio/instruments/Instrument';
import type { Note } from '../constants';


const Attributes = {
  RECORDINGS: 'recordings',
  IS_LOADED: 'isLoaded',
  IS_RECORDING: 'isRecording',
  CURRENT_RECORDING_ID: 'currentRecordingId',
  RECORDING_START_TIME: 'recordingStartTime',
  SELECTED_RECORDING_ID: 'selectedRecordingId',
  PLAYBACK_STATUS: 'playbackStatus',
  PLAYBACK_TIMESTAMP: 'playbackTimestamp',
  PLAYBACK_DURATION: 'playbackDuration',
} as const;

let recordingClient: RecordingClient | undefined;
let currentTimestamp: number = 0;
let currentPlayback: Playback | null = null;

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
  await recordingClient.createRecording();
  
  // Reload recordings to include the new one
  await loadUserRecordings();
}

export async function stopRecording() {
  const recordingId = selectCurrentRecordingId(store);
  
  if (recordingClient) {
    // Convert milliseconds to seconds for duration
    await recordingClient.updateDuration(Math.floor(currentTimestamp / 1000));
    recordingClient.close();
    recordingClient = undefined;
  }

  setRecordingStore(Attributes.IS_RECORDING, false);
  setRecordingStore(Attributes.CURRENT_RECORDING_ID, undefined);
  setRecordingStore(Attributes.RECORDING_START_TIME, 0);
  
  // Reload recordings to sync store with updated duration
  await loadUserRecordings();
  
  // Auto-select the recording that just finished
  if (recordingId) {
    await selectRecording(recordingId);
  }
}

export function recordKeyDown(note: Note, instrument: InstrumentType, audioDelay?: number) {
  if (!recordingClient) {
    throw new Error('Cannot record before recording client is initialized');
  }
  currentTimestamp = getTimestamp(audioDelay);
  recordingClient.keyDown(note, instrument, currentTimestamp);
}

export function recordKeyUp(midi: number, userId: string, audioDelay?: number) {
  if (!recordingClient) {
    throw new Error('Cannot record before recording client is initialized');
  }
  currentTimestamp = getTimestamp(audioDelay);
  recordingClient.keyUp(midi, userId, currentTimestamp);
}

export function recordSustainDown(userId: string, audioDelay?: number) {
  if (!recordingClient) {
    throw new Error('Cannot record before recording client is initialized');
  }
  currentTimestamp = getTimestamp(audioDelay);
  recordingClient.sustainDown(userId, currentTimestamp);
}

export function recordSustainUp(userId: string, audioDelay?: number) {
  if (!recordingClient) {
    throw new Error('Cannot record before recording client is initialized');
  }
  currentTimestamp = getTimestamp(audioDelay);
  recordingClient.sustainUp(userId, currentTimestamp);
}

function getTimestamp(audioDelay = 0): number {
  return Math.floor(performance.now() - selectRecordingStartTime(store) + audioDelay);
}

// Playback control functions
export async function selectRecording(recordingId: string) {
  // Stop any current playback
  await stopPlayback();
  
  setRecordingStore(Attributes.SELECTED_RECORDING_ID, recordingId);
  
  // Load duration from recording metadata
  const recordings = selectRecordings(store);
  const recording = recordings.find(r => r.id === recordingId);
  if (recording) {
    setRecordingStore(Attributes.PLAYBACK_DURATION, recording.duration);
  }
}

export async function playRecording() {
  const selectedId = selectSelectedRecordingId(store);
  if (!selectedId) return;
  
  // Stop any existing playback
  if (currentPlayback) {
    currentPlayback.stop();
  }
  
  currentPlayback = await Playback.load(selectedId, () => {
    // Callback when playback completes
    setRecordingStore(Attributes.PLAYBACK_STATUS, PlaybackStatus.STOPPED);
    setRecordingStore(Attributes.PLAYBACK_TIMESTAMP, 0);
  });
  await currentPlayback.start();
  
  setRecordingStore(Attributes.PLAYBACK_STATUS, PlaybackStatus.PLAYING);
  setRecordingStore(Attributes.PLAYBACK_TIMESTAMP, 0);
}

export async function pausePlayback() {
  if (currentPlayback) {
    currentPlayback.pause();
  }
  setRecordingStore(Attributes.PLAYBACK_STATUS, PlaybackStatus.PAUSED);
}

export async function resumePlayback() {
  if (currentPlayback) {
    currentPlayback.resume();
  }
  setRecordingStore(Attributes.PLAYBACK_STATUS, PlaybackStatus.PLAYING);
}

export async function stopPlayback() {
  if (currentPlayback) {
    currentPlayback.stop();
    currentPlayback = null;
  }
  setRecordingStore(Attributes.PLAYBACK_STATUS, PlaybackStatus.STOPPED);
  setRecordingStore(Attributes.PLAYBACK_TIMESTAMP, 0);
}

export async function previousRecording() {
  const recordings = selectRecordings(store);
  const currentId = selectSelectedRecordingId(store);
  
  if (!currentId || recordings.length === 0) return;
  
  const currentIndex = recordings.findIndex(r => r.id === currentId);
  const previousIndex = currentIndex > 0 ? currentIndex - 1 : recordings.length - 1;
  
  await selectRecording(recordings[previousIndex].id);
}

export async function nextRecording() {
  const recordings = selectRecordings(store);
  const currentId = selectSelectedRecordingId(store);
  
  if (!currentId || recordings.length === 0) return;
  
  const currentIndex = recordings.findIndex(r => r.id === currentId);
  const nextIndex = currentIndex < recordings.length - 1 ? currentIndex + 1 : 0;
  
  await selectRecording(recordings[nextIndex].id);
}

export async function deleteRecording(recordingId: string) {
  // Stop playback if this recording is currently playing
  const selectedId = selectSelectedRecordingId(store);
  if (selectedId === recordingId) {
    await stopPlayback();
    setRecordingStore(Attributes.SELECTED_RECORDING_ID, undefined);
    setRecordingStore(Attributes.PLAYBACK_DURATION, undefined);
  }
  
  // Remove from IndexedDB
  const client = new RecordingClient(recordingId);
  await client.initialize();
  await client.deleteRecording();
  
  // Reload recordings to sync store
  await loadUserRecordings();
}

export async function renameRecording(recordingId: string, newTitle: string) {
  const client = new RecordingClient(recordingId);
  await client.initialize();
  await client.updateTitle(newTitle);
  
  // Reload recordings to sync store
  await loadUserRecordings();
}
