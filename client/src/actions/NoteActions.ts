import { dispatch } from '../app/store';
import { getUser, getWorkspace } from '../lib/WorkspaceHelper';
import { addNote, removeNote } from '../slices/notesSlice';
import PianoClient from '../clients/PianoClient';
import InstrumentRegistry from '../instruments/InstrumentRegistry';
import { getAudioDelay } from '../audioSync/utils';

export function keyDown(midi: number, velocity = 100, peerId?: string) {
  if (!peerId) {
    PianoClient.keyDown(midi, velocity);
  }

  const resolvedUserId = getResolvedUserId(peerId);
  if (!resolvedUserId) {
    // can't perform piano actions before room connection are set up
    return;
  }

  InstrumentRegistry.get(resolvedUserId)?.keyDown(
    midi,
    getAudioDelay(resolvedUserId),
    velocity,
  );

  const {color} = getUser(resolvedUserId) ?? {};
  dispatch(addNote({
    midi,
    peerId: resolvedUserId,
    velocity,
    color
  }));
}

export function keyUp(midi: number, peerId?: string) {
  if (!peerId) {
    PianoClient.keyUp(midi);
  }

  const resolvedUserId = getResolvedUserId(peerId);
  if (!resolvedUserId) {
    // can't perform piano actions before room connection is set up
    return;
  }

  InstrumentRegistry.get(resolvedUserId)?.keyUp(
    midi,
    getAudioDelay(resolvedUserId),
  );
  dispatch(removeNote({
    midi,
    peerId: resolvedUserId,
    velocity: 0,
  }));
}

function getResolvedUserId(userId?: string): string | undefined {
  return userId
    || getWorkspace().userId
}
