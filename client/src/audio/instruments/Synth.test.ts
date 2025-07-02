import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PolySynth, Synth as ToneSynth } from 'tone';
import Synth from './Synth';
import { DEFAULT_VELOCITY } from '../../constants';

vi.mock('tone', () => ({
  PolySynth: vi.fn(),
  Synth: vi.fn(),
}));

vi.mock('../../lib/NoteHelpers', () => ({
  toFrequency: vi.fn((midi: number) => `${midi}Hz`),
}));

vi.mock('./getDelayTime', () => ({
  default: vi.fn((delay?: number) => delay || 0),
}));

describe('Synth', () => {
  let synth: Synth;
  let mockPolySynthInstance: any;

  beforeEach(() => {
    mockPolySynthInstance = {
      triggerAttack: vi.fn(),
      triggerRelease: vi.fn(),
      releaseAll: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
    };
    (PolySynth as any).mockImplementation(() => mockPolySynthInstance);
    synth = new Synth();
  });

  it('should configure PolySynth with square wave and correct settings', () => {
    expect(PolySynth).toHaveBeenCalledWith(ToneSynth, {
      oscillator: { type: 'square' },
      envelope: { decay: 1, release: 1 },
      volume: -20,
    });
  });

  it('should convert velocity from MIDI range (0-127) to audio range (0-1)', () => {
    synth.keyDown(60, 0, 127);
    expect(mockPolySynthInstance.triggerAttack).toHaveBeenCalledWith('60Hz', 0, 1);
    
    synth.keyDown(60, 0, 64);
    expect(mockPolySynthInstance.triggerAttack).toHaveBeenCalledWith('60Hz', 0, 64/127);
  });

  it('should use default velocity when not provided', () => {
    synth.keyDown(60, 0);
    expect(mockPolySynthInstance.triggerAttack).toHaveBeenCalledWith('60Hz', 0, DEFAULT_VELOCITY/127);
  });
});