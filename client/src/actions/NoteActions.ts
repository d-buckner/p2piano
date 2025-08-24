import { store } from '../app/store';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import { getAudioDelay } from '../audio/synchronization/utils';
import PianoClient from '../clients/PianoClient';
import { DEFAULT_VELOCITY, type Note } from '../constants';
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

  const instrument = InstrumentRegistry.get(resolvedUserId);
  if (!instrument) return;
  const audioDelay = getAudioDelay(resolvedUserId);
  instrument.keyDown(
    midi,
    audioDelay,
    velocity,
  );

  const color = getUserColor(resolvedUserId)!;
  const note: Note = {
    midi,
    peerId: resolvedUserId,
    velocity,
    color
  };

  // Start note - this handles both tracking and visualization events
  NoteManager.startNote(midi, resolvedUserId, color);

  if (shouldRecord()) {
    recordKeyDown(note, instrument.type, audioDelay);
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
  InstrumentRegistry.get(resolvedUserId)?.keyUp(
    midi,
    audioDelay,
  );

  // End note - this handles both tracking and visualization events
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

  InstrumentRegistry.get(resolvedUserId)?.sustainDown?.();

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

  InstrumentRegistry.get(resolvedUserId)?.sustainUp?.();

  if (shouldRecord()) {
    recordSustainUp(resolvedUserId);
  }
}

function shouldRecord(): boolean {
  return selectIsRecording(store);
}
