// TODO: move off of Payload and Message for better types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Payload = Record<string, any>;

export interface PeerConnections {
  [peerId: string]: {
    latency: number,
    transport: Transport,
  }
}

export interface Connection {
  maxLatency: number,
  peerConnections: PeerConnections,
}

export type Note = {
  peerId: string,
  midi: number,
  velocity: number,
  color?: string,
};

export type NotesByMidi = {
  [midi: string]: Note[];
};

export enum Transport {
  WEBSOCKET = 'WEBSOCKET',
  WEBRTC = 'WEBRTC',
};

export const DEFAULT_VELOCITY = 80;

