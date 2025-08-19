import { events } from '../proto/events.js';
import type { Codec } from './types.js';


interface LatencyPayload {
  pingTime: number;
  peerId: string;
}

export const LatencyCodec: Codec<LatencyPayload> = {
  encode(payload: LatencyPayload): Uint8Array {
    return events.LatencyEvent.encode(payload).finish();
  },
  decode(buffer: Uint8Array) {
    return events.LatencyEvent.decode(buffer);
  },
} as const;
