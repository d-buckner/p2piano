import { dispatch } from '../app/store';
import { getWorkspace } from '../lib/WorkspaceHelper';
import { addNote, removeNote } from '../slices/notesSlice';
import PianoClient from '../clients/PianoClient';
import InstrumentRegistry from '../instruments/InstrumentRegistry';
import TimeSync from '../lib/TimeSync';

export function keyDown(midi: number, velocity = 100, peerId?: string) {
  if (!peerId) {
    PianoClient.keyDown(midi, velocity);
  }
  
  const resolvedPeerId = getResolvedPeerId(peerId);
  if (!resolvedPeerId) {
    // can't perform piano actions before room connection are setup
    return;
  }

  InstrumentRegistry.get(resolvedPeerId)?.keyDown(
    midi,
    TimeSync.getInstance().getAudioDelay(resolvedPeerId),
    velocity,
  );

  const { color } = getWorkspace().room?.users?.[resolvedPeerId] || {};
  dispatch(addNote({
    note: {
      midi,
      peerId: resolvedPeerId,
      velocity,
      color
    }
  }));
}

export function keyUp(midi: number, peerId?: string) {
  if (!peerId) {
    PianoClient.keyUp(midi);
  }

  const resolvedPeerId = getResolvedPeerId(peerId);
  if (!resolvedPeerId) {
    // can't perform piano actions before room connection is setup
    return;
  }

  InstrumentRegistry.get(resolvedPeerId)?.keyUp(
    midi,
    TimeSync.getInstance().getAudioDelay(resolvedPeerId),
  );
  dispatch(removeNote({
    note: {
      midi,
      peerId: resolvedPeerId,
      velocity: 0,
    }
  }));
}

function getResolvedPeerId(peerId?: string): string | undefined {
  return peerId
    || getWorkspace().connectionId
}
