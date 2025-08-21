import { selectSharedState } from '../app/store';
import type { RootState } from '../app/store';


export const selectRecording = (state: RootState) => selectSharedState(state).recording;
export const selectIsRecording = (state: RootState) => selectRecording(state).active;
export const selectRecordingLeader = (state: RootState) => selectRecording(state).leaderId;
export const selectCurrentRecordingId = (state: RootState) => selectRecording(state).recordingId;
export const selectRecordingStartTime = (state: RootState) => selectRecording(state).startTimestamp;
export const selectRecordings = (state: RootState) => selectRecording(state).items;
