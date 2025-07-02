import { describe, it, expect, vi } from 'vitest';
import ElectricBass from './ElectricBass';
import Sampler from './Sampler';


vi.mock('./Sampler', () => ({
  default: vi.fn().mockImplementation(() => ({
    keyDown: vi.fn(),
    keyUp: vi.fn(),
  })),
}));

describe('ElectricBass', () => {
  it('should initialize Sampler with bass-electric configuration', () => {
    new ElectricBass();
    
    expect(Sampler).toHaveBeenCalledWith('bass-electric', [
      'G2',
      'E3',
      'G3',
      'E4',
      'G4',
    ]);
  });

  it('should instantiate without errors', () => {
    expect(() => new ElectricBass()).not.toThrow();
  });
});