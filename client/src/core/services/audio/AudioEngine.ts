// Basic AudioEngine service - pure audio scheduling
export interface AudioEngine {
  initialize(): Promise<void>;
  isReady(): boolean;
  setVolume(volume: number): void;
  mute(): void;
  unmute(): void;
  registerInstrument(instrumentId: string, instrumentType: string): Promise<void>;
  unregisterInstrument(instrumentId: string): void;
  scheduleEvent(event: AudioEvent): void;
}

export enum AudioEventType {
  NOTE_START = 'NOTE_START',
  NOTE_END = 'NOTE_END',
  SUSTAIN_START = 'SUSTAIN_START',
  SUSTAIN_END = 'SUSTAIN_END',
}

export interface InstrumentEvent {
  readonly type: AudioEventType;
  readonly instrumentId: string;
  readonly delay?: number;
}

// Specific event types
export interface NoteStartEvent extends InstrumentEvent {
  readonly type: AudioEventType.NOTE_START;
  readonly midi: number;
  readonly velocity: number;
}

export interface NoteEndEvent extends InstrumentEvent {
  readonly type: AudioEventType.NOTE_END;
  readonly midi: number;
}

export interface SustainStartEvent extends InstrumentEvent {
  readonly type: AudioEventType.SUSTAIN_START;
}

export interface SustainEndEvent extends InstrumentEvent {
  readonly type: AudioEventType.SUSTAIN_END;
}

export type AudioEvent = NoteStartEvent | NoteEndEvent | SustainStartEvent | SustainEndEvent;
