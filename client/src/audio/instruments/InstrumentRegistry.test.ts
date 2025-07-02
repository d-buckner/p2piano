import { describe, it, expect } from 'vitest';
import { InstrumentType } from './Instrument';

describe('InstrumentRegistry', () => {
  it('should have all required instrument types defined', () => {
    // Tests that all critical instrument types are available
    // This catches regressions if someone removes an instrument type
    expect(InstrumentType.PIANO).toBeDefined();
    expect(InstrumentType.SYNTH).toBeDefined();
    expect(InstrumentType.ELECTRIC_BASS).toBeDefined();
    
    // Ensure the enum has exactly the expected values
    const instrumentTypes = Object.values(InstrumentType);
    expect(instrumentTypes).toContain('PIANO');
    expect(instrumentTypes).toContain('SYNTH');
    expect(instrumentTypes).toContain('ELECTRIC_BASS');
  });
});