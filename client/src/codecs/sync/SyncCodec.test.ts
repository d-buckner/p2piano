import { describe, it, expect } from 'vitest';
import { LatencyEvent } from './SyncCodec';


describe('SyncCodec', () => {
  describe('LatencyEvent', () => {
    it('should encode and decode latency payload correctly', () => {
      const payload = {
        pingTime: 1234567890.123,
        peerId: 'test-peer-id'
      };

      const encoded = LatencyEvent.encode(payload);
      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = LatencyEvent.decode(encoded);
      expect(decoded).toEqual(payload);
    });
  });
});
