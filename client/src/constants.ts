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
  color: string,
};


export enum Transport {
  WEBSOCKET = 'WEBSOCKET',
  WEBRTC = 'WEBRTC',
};

export const DEFAULT_VELOCITY = 80;

export enum KeyActions {
  KEY_DOWN = 'KEY_DOWN',
  KEY_UP = 'KEY_UP',
  SUSTAIN_DOWN = 'SUSTAIN_DOWN',
  SUSTAIN_UP = 'SUSTAIN_UP',
}
