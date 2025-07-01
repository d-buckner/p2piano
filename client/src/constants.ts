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

// WebRTC Configuration for optimal latency
export const WEBRTC_CONFIG = {
  iceServers: [
    // Google STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Mozilla STUN servers
    { urls: 'stun:stun.services.mozilla.com' },
    // Additional reliable STUN servers
    { urls: 'stun:stun.stunprotocol.org:3478' },
    { urls: 'stun:stun.cloudflare.com:3478' }
  ],
  iceCandidatePoolSize: 4, // Pre-gather ICE candidates for faster connections
  iceTransportPolicy: 'all' as const,
  bundlePolicy: 'max-bundle' as const
} as const;

export const WEBRTC_OPTIONS = {
  trickle: true, // Enable trickle ICE for faster initial connections
  allowHalfTrickle: true,
  config: WEBRTC_CONFIG
} as const;
