import { produce } from 'solid-js/store';
import { store } from '../app/store';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import { getAudioDelay } from '../audio/synchronization/utils';
import PianoClient from '../clients/PianoClient';
import { DEFAULT_VELOCITY, type Note } from '../constants';
import { selectIsRecording, selectRecordingLeader } from '../selectors/recordingSelectors';
import { selectMyUser } from '../selectors/workspaceSelectors';
import { setNotesByMidiStore } from '../stores/NotesByMidiStore';
import RecordingActions from './RecordingActions';
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
  addNote(note);

  if (shouldRecord()) {
    RecordingActions.recordKeyDown(note, instrument.type, audioDelay);
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

  removeNote(midi, resolvedUserId);

  if (shouldRecord()) {
    RecordingActions.recordKeyUp(midi, resolvedUserId, audioDelay);
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
    RecordingActions.recordSustainDown(resolvedUserId);
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
    RecordingActions.recordSustainUp(resolvedUserId);
  }
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

function shouldRecord(): boolean {
  const myUserId = selectMyUser(store)?.userId ?? '';
  return selectIsRecording(store) && selectRecordingLeader(store) === myUserId;
}
