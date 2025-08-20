import { describe, it, expect } from 'vitest';
import { MetronomeTickCodec } from './MetronomeTickCodec';


describe('MetronomeTickCodec', () => {
  it('should encode and decode high tick correctly', () => {
    const payload = {
      type: 'high'
    } as const;

    const encoded = MetronomeTickCodec.encode(payload);
    expect(encoded).toBeInstanceOf(Uint8Array);
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = MetronomeTickCodec.decode(encoded);
    expect(decoded).toEqual(payload);
  });

  it('should encode and decode low tick correctly', () => {
    const payload = {
      type: 'low'
    } as const;

    const encoded = MetronomeTickCodec.encode(payload);
    expect(encoded).toBeInstanceOf(Uint8Array);
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = MetronomeTickCodec.decode(encoded);
    expect(decoded).toEqual(payload);
  });
});
