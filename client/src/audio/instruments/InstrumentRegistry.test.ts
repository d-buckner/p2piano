import { describe, it, expect } from 'vitest';
import { InstrumentType } from './Instrument';


describe('InstrumentType', () => {
  describe('enum values', () => {
    it('should define PIANO instrument type', () => {
      expect(InstrumentType.PIANO).toBe('PIANO');
    });

    it('should define SYNTH instrument type', () => {
      expect(InstrumentType.SYNTH).toBe('SYNTH');
    });

    it('should define ELECTRIC_BASS instrument type', () => {
      expect(InstrumentType.ELECTRIC_BASS).toBe('ELECTRIC_BASS');
    });
  });

  describe('enum completeness', () => {
    it('should contain exactly the expected instrument types', () => {
      const instrumentTypes = Object.values(InstrumentType);
      expect(instrumentTypes).toEqual(['PIANO', 'SYNTH', 'ELECTRIC_BASS']);
    });

    it('should have stable enum keys for backwards compatibility', () => {
      // Ensures enum keys remain stable for serialization/API compatibility
      expect(Object.keys(InstrumentType)).toEqual(['PIANO', 'SYNTH', 'ELECTRIC_BASS']);
    });
  });
});