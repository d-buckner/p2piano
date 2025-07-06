import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ClickSampler from './ClickSampler';


vi.mock('tone', () => ({
  Sampler: vi.fn()
}));

vi.mock('../instruments/getDelayTime', () => ({
  default: vi.fn((delay: number) => `+${delay}ms`)
}));

describe('ClickSampler', () => {
  let mockSampler: {
    toDestination: ReturnType<typeof vi.fn>;
    triggerAttackRelease: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
    loaded: boolean;
    debug: boolean;
  };

  beforeEach(async () => {
    mockSampler = {
      toDestination: vi.fn().mockReturnThis(),
      triggerAttackRelease: vi.fn(),
      dispose: vi.fn(),
      loaded: true,
      debug: false,
    };

    const { Sampler } = await import('tone');
    vi.mocked(Sampler).mockImplementation(() => mockSampler as unknown as InstanceType<typeof Sampler>);
  });

  afterEach(() => {
    ClickSampler.dispose();
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create a new sampler with correct configuration', async () => {
      const { Sampler } = await import('tone');
      
      await ClickSampler.initialize();

      expect(Sampler).toHaveBeenCalledWith({
        urls: {
          'C4': 'hi.ogg',
          'C3': 'low.ogg',
        },
        baseUrl: '/assets/samples/metronome/',
      });
      expect(mockSampler.toDestination).toHaveBeenCalled();
      expect(mockSampler.debug).toBe(true);
    });

    it('should not create a new sampler if already initialized', async () => {
      const { Sampler } = await import('tone');
      
      await ClickSampler.initialize();
      const firstCallCount = vi.mocked(Sampler).mock.calls.length;
      
      await ClickSampler.initialize();
      const secondCallCount = vi.mocked(Sampler).mock.calls.length;
      
      expect(secondCallCount).toBe(firstCallCount);
    });
  });

  describe('high', () => {
    it('should trigger high note with correct parameters', async () => {
      await ClickSampler.initialize();
      const delay = 100;
      
      ClickSampler.high(delay);

      expect(mockSampler.triggerAttackRelease).toHaveBeenCalledWith(
        'C4',
        '8n',
        '+100ms'
      );
    });

    it('should not trigger if sampler not initialized', () => {
      ClickSampler.high(100);
      
      expect(mockSampler.triggerAttackRelease).not.toHaveBeenCalled();
    });

    it('should not trigger if sampler not loaded', async () => {
      await ClickSampler.initialize();
      mockSampler.loaded = false;
      
      ClickSampler.high(100);
      
      expect(mockSampler.triggerAttackRelease).not.toHaveBeenCalled();
    });
  });

  describe('low', () => {
    it('should trigger low note with correct parameters', async () => {
      await ClickSampler.initialize();
      const delay = 200;
      
      ClickSampler.low(delay);

      expect(mockSampler.triggerAttackRelease).toHaveBeenCalledWith(
        'C3',
        '8n',
        '+200ms'
      );
    });

    it('should not trigger if sampler not initialized', () => {
      ClickSampler.low(100);
      
      expect(mockSampler.triggerAttackRelease).not.toHaveBeenCalled();
    });

    it('should not trigger if sampler not loaded', async () => {
      await ClickSampler.initialize();
      mockSampler.loaded = false;
      
      ClickSampler.low(100);
      
      expect(mockSampler.triggerAttackRelease).not.toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('should dispose the sampler and clear reference', async () => {
      await ClickSampler.initialize();
      
      ClickSampler.dispose();

      expect(mockSampler.dispose).toHaveBeenCalled();
      
      // Verify sampler is cleared by trying to use it
      ClickSampler.high(100);
      expect(mockSampler.triggerAttackRelease).not.toHaveBeenCalled();
    });

    it('should handle dispose when sampler not initialized', () => {
      expect(() => ClickSampler.dispose()).not.toThrow();
    });

    it('should allow re-initialization after dispose', async () => {
      const { Sampler } = await import('tone');
      
      await ClickSampler.initialize();
      ClickSampler.dispose();
      
      vi.mocked(Sampler).mockClear();
      await ClickSampler.initialize();
      
      expect(Sampler).toHaveBeenCalledTimes(1);
    });
  });
});
