import { setStore } from '../app/store';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import { getAudioDelay } from '../audio/syncronization/utils';
import PianoClient from '../clients/PianoClient';
import { DEFAULT_VELOCITY, type Note } from '../constants';
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

  InstrumentRegistry.get(resolvedUserId)?.keyDown(
    midi,
    getAudioDelay(resolvedUserId),
    velocity,
  );

  const color = getUserColor(resolvedUserId);
  const note: Note = {
    midi,
    peerId: resolvedUserId,
    velocity,
    color
  };
  
  // Add note to the store
  setStore('notesByMidi', midi.toString(), (existingNotes = []) => {
    const noteIndex = existingNotes.findIndex(n => n.peerId === resolvedUserId);
    if (noteIndex === -1) {
      return [...existingNotes, note];
    } else {
      const newNotes = [...existingNotes];
      newNotes[noteIndex] = note;
      return newNotes;
    }
  });

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

  InstrumentRegistry.get(resolvedUserId)?.keyUp(
    midi,
    getAudioDelay(resolvedUserId),
  );
  // Remove note from the store
  setStore('notesByMidi', midi.toString(), (existingNotes = []) => {
    const filteredNotes = existingNotes.filter(note => note.peerId !== resolvedUserId);
    return filteredNotes.length > 0 ? filteredNotes : undefined;
  });

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
}

