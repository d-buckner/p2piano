import { describe, it, expect } from 'vitest';
import { encode, decode, encodeEnvelope, decodeEnvelope } from './EventCodec';


describe('EventCodec', () => {
  describe('METRONOME_TICK', () => {
    it('should encode and decode metronome tick events using protobuf', () => {
      const payload = {
        type: 'high'
      };

      const encoded = encode('METRONOME_TICK', payload);
      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = decode('METRONOME_TICK', encoded);
      expect(decoded).toEqual(payload);
    });

    it('should handle low tick through envelope system', () => {
      const payload = {
        type: 'low'
      };

      const envelope = encodeEnvelope('METRONOME_TICK', payload);
      expect(envelope).toBeInstanceOf(Uint8Array);

      const decoded = decodeEnvelope(envelope);
      expect(decoded.eventType).toBe('METRONOME_TICK');
      expect(decoded.payload).toEqual(payload);
    });
  });

  describe('Latency Events', () => {
    describe('LATENCY_PING', () => {
      it('should encode and decode latency ping events using protobuf', () => {
        const payload = {
          pingTime: 1234567890.123,
          peerId: 'test-ping-peer'
        };

        const encoded = encode('LATENCY_PING', payload);
        expect(encoded).toBeInstanceOf(Uint8Array);
        expect(encoded.length).toBeGreaterThan(0);

        const decoded = decode('LATENCY_PING', encoded);
        expect(decoded).toEqual(payload);
      });
    });

    describe('LATENCY_PONG', () => {
      it('should encode and decode latency pong events using protobuf', () => {
        const payload = {
          pingTime: 9876543210.456,
          peerId: 'test-pong-peer'
        };

        const encoded = encode('LATENCY_PONG', payload);
        expect(encoded).toBeInstanceOf(Uint8Array);

        const decoded = decode('LATENCY_PONG', encoded);
        expect(decoded).toEqual(payload);
      });
    });

    describe('envelope integration', () => {
      it('should encode and decode latency events through envelope system', () => {
        const pingPayload = {
          pingTime: performance.now(),
          peerId: 'envelope-ping-peer'
        };

        const pongPayload = {
          pingTime: performance.now() + 100,
          peerId: 'envelope-pong-peer'
        };

        // Test PING through envelope
        const pingEnvelope = encodeEnvelope('LATENCY_PING', pingPayload);
        expect(pingEnvelope).toBeInstanceOf(Uint8Array);
        const decodedPing = decodeEnvelope(pingEnvelope);
        expect(decodedPing.eventType).toBe('LATENCY_PING');
        expect(decodedPing.payload).toEqual(pingPayload);

        // Test PONG through envelope  
        const pongEnvelope = encodeEnvelope('LATENCY_PONG', pongPayload);
        expect(pongEnvelope).toBeInstanceOf(Uint8Array);
        const decodedPong = decodeEnvelope(pongEnvelope);
        expect(decodedPong.eventType).toBe('LATENCY_PONG');
        expect(decodedPong.payload).toEqual(pongPayload);
      });

      it('should produce smaller binary size than JSON for latency events', () => {
        const payload = {
          pingTime: 1234567890.123458,
          peerId: 'test-performance-peer-with-long-id'
        };

        // Protobuf encoding
        const protobufEncoded = encode('LATENCY_PING', payload);

        // JSON encoding (fallback for unregistered event)
        const jsonEncoded = encode('UNKNOWN_EVENT', payload);

        expect(protobufEncoded.length).toBeLessThan(jsonEncoded.length);
      });
    });
  });
});
