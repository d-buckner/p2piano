import type { KeyActions } from '../../constants';
import type { InstrumentType } from '../instruments/Instrument';


export interface RecordingMetadata {
  title: string,
  id: string, // client generated (can't trust)
  displayNames: string[]
}

export type PersistedRecordingMetadata = {
  internalId: string // server generated id (can trust)
} & RecordingMetadata;

export interface RequiredInstruments {
  [userId: string]: InstrumentType[]
}

interface BaseRecordingEvent {
  timestamp: number;
  recordingId: string;
  userId: string,
}

type KeyEvent = {
  midi: number;
} & BaseRecordingEvent

export type KeyDownEvent = {
  type: KeyActions.KEY_DOWN,
  velocity: number,
  instrument: InstrumentType,
  color: string,
} & KeyEvent;

export type KeyUpEvent = {
  type: KeyActions.KEY_UP
} & KeyEvent;

export type SustainDownEvent = {
  type: KeyActions.SUSTAIN_DOWN
} & BaseRecordingEvent

export type SustainUpEvent = {
  type: KeyActions.SUSTAIN_UP
} & BaseRecordingEvent;

export type RecordingEvent = KeyUpEvent | KeyDownEvent | SustainDownEvent | SustainUpEvent;
