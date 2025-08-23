import type { RootState } from '../app/store';


export const selectRecording = (state: RootState) => state.recording;
export const selectRecordings = (state: RootState) => selectRecording(state).recordings;
export const selectRecordingsLoaded = (state: RootState) => selectRecording(state).isLoaded;
export const selectIsRecording = (state: RootState) => selectRecording(state).isRecording;
export const selectCurrentRecordingId = (state: RootState) => selectRecording(state).currentRecordingId;
export const selectRecordingStartTime = (state: RootState) => selectRecording(state).recordingStartTime;
