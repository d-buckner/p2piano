import { produce } from 'solid-js/store';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import { getAudioDelay } from '../audio/synchronization/utils';
import PianoClient from '../clients/PianoClient';
import { DEFAULT_VELOCITY, type Note } from '../constants';
import { setNotesByMidiStore } from '../stores/NotesByMidiStore';
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
  addNote({
    midi,
    peerId: resolvedUserId,
    velocity,
    color
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

  removeNote(midi, resolvedUserId);

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

function addNote(note: Note) {
   // Add note to the store
  setNotesByMidiStore(note.midi.toString(), (existingNotes = []) => {
    const noteIndex = existingNotes.findIndex(n => n.peerId === note.peerId);
    if (noteIndex === -1) {
      return [...existingNotes, note];
    } else {
      const newNotes = [...existingNotes];
      newNotes[noteIndex] = note;
      return newNotes;
    }
  }); 
}

function removeNote(midi: number, peerId: string) {
    setNotesByMidiStore(produce((store) => {
    if (!store[midi]) return;
    
    const filteredNotes = store[midi].filter(note => note.peerId !== peerId);
    if (filteredNotes.length === 0) {
      delete store[midi];
      return;
    }
    
    store[midi] = filteredNotes;
  }));
}
