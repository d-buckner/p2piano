import { describe, it, expect } from 'vitest';
import { KeyDownCodec, KeyUpCodec } from './NoteCodec';


describe('NoteCodec', () => {
  describe('KeyDownEvent', () => {
    it('should encode and decode latency payload correctly', () => {
      const payload = {
        note: 41,
        velocity: 100
      } as const;

      const encoded = KeyDownCodec.encode(payload);
      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = KeyDownCodec.decode(encoded);
      expect(decoded).toEqual(payload);
    });
  });

    describe('KeyUpEvent', () => {
    it('should encode and decode latency payload correctly', () => {
      const payload = {
        note: 41,
      } as const;

      const encoded = KeyUpCodec.encode(payload);
      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = KeyUpCodec.decode(encoded);
      expect(decoded).toEqual(payload);
    });
  });
});
