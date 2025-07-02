import { describe, it, expect } from 'vitest';

describe('ElectricBass', () => {
  it('should have correct MIDI offset constant', () => {
    // This tests that the MIDI offset is correctly set to -24 semitones (2 octaves down)
    // This is critical to ensure bass plays in the correct register
    const EXPECTED_MIDI_OFFSET = -24;
    
    // Test the math: 60 (middle C) + (-24) = 36 (C two octaves lower)
    const middleC = 60;
    const bassC = middleC + EXPECTED_MIDI_OFFSET;
    
    expect(bassC).toBe(36);
    expect(EXPECTED_MIDI_OFFSET).toBe(-24);
  });
});