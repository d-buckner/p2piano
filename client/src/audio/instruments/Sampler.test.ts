import { Sampler as ToneSampler } from 'tone';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sampler from './Sampler';


vi.mock('tone', () => ({
  Sampler: vi.fn(),
}));

vi.mock('../../lib/NoteHelpers', () => ({
  toFrequency: vi.fn((midi: number) => `${midi}Hz`),
}));

vi.mock('./getDelayTime', () => ({
  default: vi.fn((delay?: number) => delay || 0),
}));

describe('Sampler', () => {
  let mockSamplerInstance: {
    triggerAttack: ReturnType<typeof vi.fn>;
    triggerRelease: ReturnType<typeof vi.fn>;
    releaseAll: ReturnType<typeof vi.fn>;
    toDestination: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockSamplerInstance = {
      triggerAttack: vi.fn(),
      triggerRelease: vi.fn(),
      releaseAll: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ToneSampler as any).mockImplementation(() => mockSamplerInstance);
  });

  it('should generate correct sample URLs and base path', () => {
    const notenames = ['C3', 'E3', 'G3'];
    new Sampler('test-instrument', notenames);

    expect(ToneSampler).toHaveBeenCalledWith({
      urls: {
        'C3': 'C3.mp3',
        'E3': 'E3.mp3', 
        'G3': 'G3.mp3',
      },
      baseUrl: '/assets/samples/test-instrument/',
    });
  });

  it('should handle sharp and flat note names correctly', () => {
    const notenames = ['C#3', 'Bb4'];
    new Sampler('test', notenames);

    expect(ToneSampler).toHaveBeenCalledWith({
      urls: {
        'C#3': 'C#3.mp3',
        'Bb4': 'Bb4.mp3',
      },
      baseUrl: '/assets/samples/test/',
    });
  });
});