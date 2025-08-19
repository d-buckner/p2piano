import type { Codec } from './types.js';


const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const TextCodec: Codec = {
  encode(payload): Uint8Array {
    return textEncoder.encode(JSON.stringify(payload));
  },
  decode(buffer: Uint8Array) {
    return JSON.parse(textDecoder.decode(buffer));
  },
} as const;
