import { describe, it, expect } from 'vitest';
import { TextCodec } from './TextCodec';


describe('TextCodec', () => {
    it('should encode and decode', () => {
      const payload = {
        note: 41,
        velocity: 100
      } as const;

      const encoded = TextCodec.encode(payload);
      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = TextCodec.decode(encoded);
      expect(decoded).toEqual(payload);
    });
});
