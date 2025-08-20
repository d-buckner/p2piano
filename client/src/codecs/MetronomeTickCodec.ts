import { events } from '../proto/events.js';
import type { Codec } from './types.js';


interface MetronomeTickPayload {
  type: string;
}

export const MetronomeTickCodec: Codec<MetronomeTickPayload> = {
  encode(payload: MetronomeTickPayload): Uint8Array {
    return events.MetronomeTickEvent.encode(payload).finish();
  },
  decode(buffer: Uint8Array) {
    return events.MetronomeTickEvent.decode(buffer);
  },
} as const;
