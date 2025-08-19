import { events } from '../../proto/events.js';
import type { Codec } from '../types.js';


interface KeyDownPayload {
  note: number;
  velocity: number;
}

interface KeyUpPayload {
  note: number;
}

export const KeyDownEvent: Codec<KeyDownPayload> = {
  encode(payload: KeyDownPayload): Uint8Array {
    return events.KeyDownEvent.encode(payload).finish();
  },
  decode(buffer: Uint8Array): KeyDownPayload {
    return events.KeyDownEvent.decode(buffer);
  },
} as const;

export const KeyUpEvent: Codec<KeyUpPayload> = {
  encode(payload: KeyUpPayload): Uint8Array {
    return events.KeyUpEvent.encode(payload).finish();
  },
  decode(buffer: Uint8Array): KeyUpPayload {
    return events.KeyUpEvent.decode(buffer);
  },
} as const;
