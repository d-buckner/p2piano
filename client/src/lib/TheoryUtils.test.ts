import { describe, it, expect } from 'vitest';
import { getClosestDiatonicLeft, getClosestDiatonicRight } from './TheoryUtils';


describe('TheoryUtils', () => {
  describe('getClosestDiatonicLeft', () => {
    it('should return the same note if already diatonic', () => {
      expect(getClosestDiatonicLeft(60)).toBe(60); // C
      expect(getClosestDiatonicLeft(62)).toBe(62); // D
      expect(getClosestDiatonicLeft(64)).toBe(64); // E
      expect(getClosestDiatonicLeft(65)).toBe(65); // F
      expect(getClosestDiatonicLeft(67)).toBe(67); // G
      expect(getClosestDiatonicLeft(69)).toBe(69); // A
      expect(getClosestDiatonicLeft(71)).toBe(71); // B
    });

    it('should find closest diatonic note to the left for chromatic notes', () => {
      expect(getClosestDiatonicLeft(61)).toBe(60); // C# -> C
      expect(getClosestDiatonicLeft(63)).toBe(62); // D# -> D
      expect(getClosestDiatonicLeft(66)).toBe(65); // F# -> F
      expect(getClosestDiatonicLeft(68)).toBe(67); // G# -> G
      expect(getClosestDiatonicLeft(70)).toBe(69); // A# -> A
    });

    it('should handle octave boundaries', () => {
      expect(getClosestDiatonicLeft(72)).toBe(72); // C5 (diatonic)
      expect(getClosestDiatonicLeft(73)).toBe(72); // C#5 -> C5
    });

    it('should handle edge cases', () => {
      expect(getClosestDiatonicLeft(0)).toBe(0); // C-1
      expect(getClosestDiatonicLeft(1)).toBe(0); // C#-1 -> C-1
    });
  });

  describe('getClosestDiatonicRight', () => {
    it('should return the same note if already diatonic', () => {
      expect(getClosestDiatonicRight(60)).toBe(60); // C
      expect(getClosestDiatonicRight(62)).toBe(62); // D
      expect(getClosestDiatonicRight(64)).toBe(64); // E
      expect(getClosestDiatonicRight(65)).toBe(65); // F
      expect(getClosestDiatonicRight(67)).toBe(67); // G
      expect(getClosestDiatonicRight(69)).toBe(69); // A
      expect(getClosestDiatonicRight(71)).toBe(71); // B
    });

    it('should find closest diatonic note to the right for chromatic notes', () => {
      expect(getClosestDiatonicRight(61)).toBe(62); // C# -> D
      expect(getClosestDiatonicRight(63)).toBe(64); // D# -> E
      expect(getClosestDiatonicRight(66)).toBe(67); // F# -> G
      expect(getClosestDiatonicRight(68)).toBe(69); // G# -> A
      expect(getClosestDiatonicRight(70)).toBe(71); // A# -> B
    });

    it('should handle octave boundaries', () => {
      expect(getClosestDiatonicRight(72)).toBe(72); // C5 (diatonic)
      expect(getClosestDiatonicRight(73)).toBe(74); // C#5 -> D5
    });

    it('should handle edge cases', () => {
      expect(getClosestDiatonicRight(126)).toBe(127); // F#9 -> G9
      expect(getClosestDiatonicRight(127)).toBe(127); // G9 (diatonic)
    });
  });
});
