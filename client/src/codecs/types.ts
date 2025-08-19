export interface Codec<T = unknown> {
  encode(payload: T): Uint8Array;
  decode(buffer: Uint8Array): T;
}

export type Payload = Record<string, unknown>;
