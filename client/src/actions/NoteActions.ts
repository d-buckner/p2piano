import { store } from '../app/store';
import { getAudioDelay } from '../audio/synchronization/utils';
import PianoClient from '../clients/PianoClient';
import { DEFAULT_VELOCITY, type Note } from '../constants';
import { appContainer } from '../core/AppContainer';
import { AudioEventType } from '../core/services/audio/AudioEngine';
import { ServiceTokens } from '../core/ServiceTokens';
import { NoteManager } from '../lib/NoteManager';
import { selectIsRecording } from '../selectors/recordingSelectors';
import { recordKeyDown, recordKeyUp, recordSustainDown, recordSustainUp } from './RecordingActions';
import { getResolvedUserId, getUserColor } from './utils';


export function keyDown(midi: number, velocity = DEFAULT_VELOCITY, peerId?: string): string | undefined {
  if (!peerId) {
    PianoClient.keyDown(midi, velocity);
  }

  const resolvedUserId = getResolvedUserId(peerId);
  if (!resolvedUserId) {
    // can't perform piano actions before room connection are set up
    return;
  }

  const color = getUserColor(resolvedUserId);
  if (!color) return;

  const audioEngine = appContainer.resolve(ServiceTokens.AudioEngine);
  const audioDelay = getAudioDelay(resolvedUserId);
  
  // Schedule note start event with AudioEngine
  audioEngine.scheduleEvent({
    type: AudioEventType.NOTE_START,
    instrumentId: resolvedUserId,
    midi,
    velocity,
    delay: audioDelay
  });

  const note: Note = {
    midi,
    peerId: resolvedUserId,
    velocity,
    color
  };

  NoteManager.startNote(midi, resolvedUserId, color);

  if (shouldRecord()) {
    // TODO: Get instrument type from registered instruments or pass it through
    recordKeyDown(note, 'PIANO', audioDelay);
  }

  // Return color for piano visualizer
  return color;
}

export function keyUp(midi: number, peerId?: string): string | undefined {
  if (!peerId) {
    PianoClient.keyUp(midi);
  }

  const resolvedUserId = getResolvedUserId(peerId);
  if (!resolvedUserId) {
    // can't perform piano actions before room connection is set up
    return;
  }

  const audioDelay = getAudioDelay(resolvedUserId);
  const audioEngine = appContainer.resolve(ServiceTokens.AudioEngine);
  
  // Schedule note end event with AudioEngine
  audioEngine.scheduleEvent({
    type: AudioEventType.NOTE_END,
    instrumentId: resolvedUserId,
    midi,
    delay: audioDelay
  });

  NoteManager.endNote(midi, resolvedUserId);

  if (shouldRecord()) {
    recordKeyUp(midi, resolvedUserId, audioDelay);
  }

  // keyUp doesn't need to return a color for visualization
  return undefined;
}

export function sustainDown(peerId?: string): void {
  if (!peerId) {
    PianoClient.sustainDown();
  }

  const resolvedUserId = getResolvedUserId(peerId);
  if (!resolvedUserId) {
    // can't perform piano actions before room connection are set up
    return;
  }

  const audioEngine = appContainer.resolve(ServiceTokens.AudioEngine);
  
  // Schedule sustain start event with AudioEngine
  audioEngine.scheduleEvent({
    type: AudioEventType.SUSTAIN_START,
    instrumentId: resolvedUserId
  });

  if (shouldRecord()) {
    recordSustainDown(resolvedUserId);
  }
}

export function sustainUp(peerId?: string): void {
  if (!peerId) {
    PianoClient.sustainUp();
  }

  const resolvedUserId = getResolvedUserId(peerId);
  if (!resolvedUserId) {
    // can't perform piano actions before room connection are set up
    return;
  }

  const audioEngine = appContainer.resolve(ServiceTokens.AudioEngine);
  
  // Schedule sustain end event with AudioEngine
  audioEngine.scheduleEvent({
    type: AudioEventType.SUSTAIN_END,
    instrumentId: resolvedUserId
  });

  if (shouldRecord()) {
    recordSustainUp(resolvedUserId);
  }
}

function shouldRecord(): boolean {
  return selectIsRecording(store);
}
