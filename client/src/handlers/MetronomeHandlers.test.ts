import { describe, it, expect, vi, beforeEach } from 'vitest';
import AudioManager from '../audio/AudioManager';
import ClickSampler from '../audio/metronome/ClickSampler';
import { getAudioDelay } from '../audio/synchronization/utils';
import { TICK_TYPE } from '../constants/metronome';
import { selectMyUser } from '../selectors/workspaceSelectors';
import MetronomeHandlers from './MetronomeHandlers';

// Mock AudioEngine service
const mockAudioEngine = {
  isReady: vi.fn(() => true),
  initialize: vi.fn(),
  scheduleEvent: vi.fn()
};

// Mock AppContainer
vi.mock('../core/AppContainer', () => ({
  appContainer: {
    resolve: vi.fn((token) => {
      if (token.name === 'AudioEngine') {
        return mockAudioEngine;
      }
      throw new Error(`Service ${token.name} is not registered`);
    })
  }
}));

// Mock dependencies
vi.mock('../app/store', () => ({
  store: {
    workspace: {
      user: { userId: 'test-user-123' }
    }
  }
}));

vi.mock('../audio/AudioManager', () => ({
  default: {
    active: true
  }
}));

vi.mock('../audio/metronome/ClickSampler', () => ({
  default: {
    high: vi.fn(),
    low: vi.fn()
  }
}));

vi.mock('../audio/synchronization/utils', () => ({
  getAudioDelay: vi.fn().mockReturnValue(0.1)
}));

vi.mock('../selectors/workspaceSelectors', () => ({
  selectMyUser: vi.fn().mockReturnValue({ userId: 'test-user-123' })
}));

const mockClickSampler = vi.mocked(ClickSampler);
const mockGetAudioDelay = vi.mocked(getAudioDelay);
const mockSelectMyUser = vi.mocked(selectMyUser);

describe('MetronomeHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AudioManager.active = true;
    mockGetAudioDelay.mockReturnValue(0.1);
    mockAudioEngine.isReady.mockReturnValue(true);
  });

  describe('tickHandler', () => {
    it('should play high tick for HI tick type', () => {
      MetronomeHandlers.tickHandler({
        type: TICK_TYPE.HI,
        userId: 'other-user'
      });

      expect(mockClickSampler.high).toHaveBeenCalledWith(0.1);
      expect(mockClickSampler.low).not.toHaveBeenCalled();
    });

    it('should play low tick for LOW tick type', () => {
      MetronomeHandlers.tickHandler({
        type: TICK_TYPE.LOW,
        userId: 'other-user'
      });

      expect(mockClickSampler.low).toHaveBeenCalledWith(0.1);
      expect(mockClickSampler.high).not.toHaveBeenCalled();
    });

    it('should not play tick from own user (leader sending)', () => {
      mockSelectMyUser.mockReturnValue({ userId: 'test-user-123' });

      MetronomeHandlers.tickHandler({
        type: TICK_TYPE.HI,
        userId: 'test-user-123'
      });

      expect(mockClickSampler.high).not.toHaveBeenCalled();
      expect(mockClickSampler.low).not.toHaveBeenCalled();
    });

    it('should not play tick when AudioEngine is inactive', () => {
      mockAudioEngine.isReady.mockReturnValue(false);

      MetronomeHandlers.tickHandler({
        type: TICK_TYPE.HI,
        userId: 'other-user'
      });

      expect(mockClickSampler.high).not.toHaveBeenCalled();
      expect(mockClickSampler.low).not.toHaveBeenCalled();
    });

    it('should not play tick when userId is missing', () => {
      MetronomeHandlers.tickHandler({
        type: TICK_TYPE.HI,
        userId: undefined
      });

      expect(mockClickSampler.high).not.toHaveBeenCalled();
      expect(mockClickSampler.low).not.toHaveBeenCalled();
    });

    it('should calculate audio delay for the specific user', () => {
      mockGetAudioDelay.mockReturnValue(0.05);

      MetronomeHandlers.tickHandler({
        type: TICK_TYPE.HI,
        userId: 'specific-user'
      });

      expect(mockGetAudioDelay).toHaveBeenCalledWith('specific-user');
      expect(mockClickSampler.high).toHaveBeenCalledWith(0.05);
    });

    it('should handle undefined selectMyUser result', () => {
      mockSelectMyUser.mockReturnValue(null);

      MetronomeHandlers.tickHandler({
        type: TICK_TYPE.HI,
        userId: 'other-user'
      });

      // Should play since no own userId to compare against
      expect(mockClickSampler.high).toHaveBeenCalledWith(0.1);
    });

    it('should handle different tick types correctly', () => {
      // Test HI tick
      MetronomeHandlers.tickHandler({
        type: TICK_TYPE.HI,
        userId: 'other-user'
      });

      expect(mockClickSampler.high).toHaveBeenCalledWith(0.1);
      vi.clearAllMocks();

      // Test LOW tick  
      MetronomeHandlers.tickHandler({
        type: TICK_TYPE.LOW,
        userId: 'other-user'
      });

      expect(mockClickSampler.low).toHaveBeenCalledWith(0.1);
    });
  });
});
