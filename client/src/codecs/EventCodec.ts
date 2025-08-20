import { EnvelopeCodec } from './EnvelopeCodec';
import { MetronomeTickCodec } from './MetronomeTickCodec';
import { KeyDownCodec, KeyUpCodec } from './NoteCodec';
import { LatencyCodec } from './SyncCodec';
import { TextCodec } from './TextCodec';
import type { Payload, Codec } from './types';


interface DecodedEnvelope<T> {
  eventType: string,
  payload: T,
}

const CodecRegistry: Record<string, Codec> = {
  KEY_DOWN: KeyDownCodec,
  KEY_UP: KeyUpCodec,
  LATENCY_PING: LatencyCodec,
  LATENCY_PONG: LatencyCodec,
  METRONOME_TICK: MetronomeTickCodec,
} as const;

function getCodec<T = unknown>(eventType: string): Codec<T> | undefined {
  return CodecRegistry[eventType] as Codec<T>;
}

export function encode<T = unknown>(eventType: string, payload: T): Uint8Array {
  const codec = getCodec(eventType);
  if (codec) {
    return codec.encode(payload);
  }

  return TextCodec.encode(payload);
}

export function decode<T = unknown>(eventType: string, payload: Uint8Array): T {
  const codec = getCodec<T>(eventType);
  if (codec) {
    return codec.decode(payload);
  }

  return TextCodec.decode(payload) as T;
}

export function encodeEnvelope<T extends Payload = Payload>(eventType: string, payload?: T): Uint8Array {
  return EnvelopeCodec.encode({
    eventType,
    payload: encode(eventType, payload),
  });
}

export function decodeEnvelope<T extends Payload = Payload>(envelope: Uint8Array): DecodedEnvelope<T> {
  const { eventType, payload } = EnvelopeCodec.decode(envelope);

  return {
    eventType,
    payload: decode<T>(eventType, payload),
  };
}
