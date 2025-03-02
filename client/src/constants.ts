export type Payload = Record<string, any>;

export type Note = {
  peerId: string,
  midi: number,
  velocity: number,
  color?: string,
};

export type NotesByMidi = {
  [midi: string]: Note[];
};

export type MidiRange = [number, number];

export enum Transports {
  WEBSOCKETS = 'WEBSOCKETS',
  WEBRTC = 'WEBRTC',
};
