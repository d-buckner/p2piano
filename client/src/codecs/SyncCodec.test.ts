import { describe, it, expect } from 'vitest';
import { LatencyCodec } from './SyncCodec';


describe('SyncCodec', () => {
  describe('LatencyEvent', () => {
    it('should encode and decode latency payload correctly', () => {
      const payload = {
        pingTime: 1234567890.123,
        peerId: 'test-peer-id'
      };

      const encoded = LatencyCodec.encode(payload);
      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = LatencyCodec.decode(encoded);
      expect(decoded).toEqual(payload);
    });
  });
});
