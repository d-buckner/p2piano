import { audio } from './proto/audio_pb.js';
import type { MessageCodec } from '../network/INetworkService';

// Audio message payload types
export interface KeyDownPayload {
  note: number;
  velocity: number;
}

export interface KeyUpPayload {
  note: number;
}

// Audio service codecs for optimized binary encoding
export const AudioCodecs = {
  KeyDown: {
    encode(payload: KeyDownPayload): Uint8Array {
      return audio.KeyDownEvent.encode(payload).finish();
    },
    decode(buffer: Uint8Array): KeyDownPayload {
      return audio.KeyDownEvent.decode(buffer);
    },
  } as MessageCodec<KeyDownPayload>,

  KeyUp: {
    encode(payload: KeyUpPayload): Uint8Array {
      return audio.KeyUpEvent.encode(payload).finish();
    },
    decode(buffer: Uint8Array): KeyUpPayload {
      return audio.KeyUpEvent.decode(buffer);
    },
  } as MessageCodec<KeyUpPayload>,

  // Sustain events don't need codecs - they're simple string messages
} as const;
