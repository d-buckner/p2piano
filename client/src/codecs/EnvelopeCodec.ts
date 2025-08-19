import { events } from '../proto/events.js';
import type { Codec } from './types.js';


interface EnvelopePayload {
  eventType: string;
  payload: Uint8Array;
}

export const EnvelopeCodec: Codec<EnvelopePayload> = {
  encode(payload: EnvelopePayload): Uint8Array {
    return events.Envelope.encode(payload).finish();
  },
  decode(buffer: Uint8Array) {
    return events.Envelope.decode(buffer);
  },
} as const;
