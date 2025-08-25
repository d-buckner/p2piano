import type { RootState } from '../app/store';


export const selectRecording = (state: RootState) => state.recording;
export const selectRecordings = (state: RootState) => selectRecording(state).recordings;
export const selectRecordingsLoaded = (state: RootState) => selectRecording(state).isLoaded;
export const selectIsRecording = (state: RootState) => selectRecording(state).isRecording;
export const selectCurrentRecordingId = (state: RootState) => selectRecording(state).currentRecordingId;
export const selectRecordingStartTime = (state: RootState) => selectRecording(state).recordingStartTime;

// Playback selectors
export const selectSelectedRecordingId = (state: RootState) => selectRecording(state).selectedRecordingId;
export const selectSelectedRecording = (state: RootState) => {
  const selectedId = selectSelectedRecordingId(state);
  const recordings = selectRecordings(state);
  return selectedId ? recordings.find(r => r.id === selectedId) : undefined;
};
export const selectPlaybackStatus = (state: RootState) => selectRecording(state).playbackStatus;
export const selectPlaybackTimestamp = (state: RootState) => selectRecording(state).playbackTimestamp;
export const selectPlaybackDuration = (state: RootState) => selectRecording(state).playbackDuration;
