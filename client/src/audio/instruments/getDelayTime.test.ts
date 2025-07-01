import { describe, it, expect } from 'vitest';
import getDelayTime from './getDelayTime';


describe('getDelayTime', () => {
  it('should return "+0" for no delay', () => {
    expect(getDelayTime(0)).toBe('+0');
  });

  it('should return "+0" for default parameter', () => {
    expect(getDelayTime()).toBe('+0');
  });

  it('should convert milliseconds to seconds with "+" prefix', () => {
    expect(getDelayTime(1000)).toBe('+1');
    expect(getDelayTime(2500)).toBe('+2.5');
    expect(getDelayTime(500)).toBe('+0.5');
  });

  it('should handle fractional milliseconds', () => {
    expect(getDelayTime(1500)).toBe('+1.5');
    expect(getDelayTime(750)).toBe('+0.75');
    expect(getDelayTime(100)).toBe('+0.1');
  });

  it('should handle very small delays', () => {
    expect(getDelayTime(1)).toBe('+0.001');
    expect(getDelayTime(10)).toBe('+0.01');
  });

  it('should handle negative delays by converting to zero', () => {
    expect(getDelayTime(-1000)).toBe('+0');
    expect(getDelayTime(-500)).toBe('+0');
  });

  it('should handle zero delay explicitly', () => {
    expect(getDelayTime(0)).toBe('+0');
  });
});