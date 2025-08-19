import { EnvelopeEvent } from './EnvelopeCodec';
import { KeyDownEvent, KeyUpEvent } from './note/NoteCodec';
import { LatencyEvent } from './sync/SyncCodec';
import type { Payload, Codec } from './types';


const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

interface DecodedEnvelope<T> {
  eventType: string,
  payload: T,
}

const CodecRegistry: Record<string, Codec> = {
  KEY_DOWN: KeyDownEvent,
  KEY_UP: KeyUpEvent,
  LATENCY_PING: LatencyEvent,
  LATENCY_PONG: LatencyEvent,
} as const;

function getCodec<T = unknown>(eventType: string): Codec<T> | undefined {
  return CodecRegistry[eventType] as Codec<T>;
}

export function encode<T = unknown>(eventType: string, payload: T): Uint8Array {
  const codec = getCodec(eventType);
  if (codec) {
    return codec.encode(payload);
  }

  return textEncoder.encode(JSON.stringify(payload));
}

export function decode<T = unknown>(eventType: string, payload: Uint8Array): T {
  const codec = getCodec<T>(eventType);
  if (codec) {
    return codec.decode(payload);
  }

  return JSON.parse(textDecoder.decode(payload));
}

export function encodeEnvelope<T extends Payload = Payload>(eventType: string, payload?: T): Uint8Array {
  return EnvelopeEvent.encode({
    eventType,
    payload: encode(eventType, payload),
  });
}

export function decodeEnvelope<T extends Payload = Payload>(envelope: Uint8Array): DecodedEnvelope<T> {
  const { eventType, payload } = EnvelopeEvent.decode(envelope);

  return {
    eventType,
    payload: decode<T>(eventType, payload),
  };
}
