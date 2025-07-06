import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ElectricBass from './ElectricBass';
import Sampler from './Sampler';

// Mock only the Tone.js dependency that Sampler uses
vi.mock('tone', () => ({
  Sampler: vi.fn().mockImplementation(() => ({
    toDestination: vi.fn(),
    triggerAttack: vi.fn(),
    triggerRelease: vi.fn(),
    releaseAll: vi.fn(),
  })),
}));

describe('ElectricBass', () => {
  it('should apply -24 semitone MIDI offset for bass range', () => {
    // Mock the parent class methods directly on the prototype
    const mockKeyDown = vi.spyOn(Sampler.prototype, 'keyDown').mockImplementation(vi.fn());
    const mockKeyUp = vi.spyOn(Sampler.prototype, 'keyUp').mockImplementation(vi.fn());
    
    const bass = new ElectricBass();
    
    // Test keyDown with MIDI offset
    bass.keyDown(60, 0, 127); // Middle C (C4)
    expect(mockKeyDown).toHaveBeenCalledWith(36, 0, 127); // C2 (36 = 60 - 24)
    
    // Test keyUp with MIDI offset  
    bass.keyUp(72, 100); // C5
    expect(mockKeyUp).toHaveBeenCalledWith(48, 100); // C3 (48 = 72 - 24)
    
    // Clean up
    mockKeyDown.mockRestore();
    mockKeyUp.mockRestore();
  });
});