import { describe, it, expect } from 'vitest';
import { KeyDownEvent, KeyUpEvent } from './NoteCodec';


describe('NoteCodec', () => {
  describe('KeyDownEvent', () => {
    it('should encode and decode latency payload correctly', () => {
      const payload = {
        note: 41,
        velocity: 100
      } as const;

      const encoded = KeyDownEvent.encode(payload);
      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = KeyDownEvent.decode(encoded);
      expect(decoded).toEqual(payload);
    });
  });

    describe('KeyUpEvent', () => {
    it('should encode and decode latency payload correctly', () => {
      const payload = {
        note: 41,
      } as const;

      const encoded = KeyUpEvent.encode(payload);
      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = KeyUpEvent.decode(encoded);
      expect(decoded).toEqual(payload);
    });
  });
});
