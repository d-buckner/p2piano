import { beforeEach, describe, expect, it, vi } from 'vitest';
import RealTimeController from '../networking/RealTimeController';
import MetronomeClient from './MetronomeClient';
import type { TickType } from '../constants/metronome';


vi.mock('../networking/RealTimeController', () => ({
  default: {
    getInstance: vi.fn()
  }
}));

describe('MetronomeClient', () => {
  let mockBroadcast: ReturnType<typeof vi.fn>;
  let mockGetInstance: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockBroadcast = vi.fn();
    mockGetInstance = vi.fn().mockReturnValue({
      broadcast: mockBroadcast
    });
    vi.mocked(RealTimeController.getInstance).mockImplementation(mockGetInstance);
  });

  it('should broadcast tick with correct type', () => {
    const tickType: TickType = 'BEAT';
    MetronomeClient.tick(tickType);

    expect(mockGetInstance).toHaveBeenCalled();
    expect(mockBroadcast).toHaveBeenCalledWith('METRONOME_TICK', { type: tickType });
  });

  it('should broadcast tick with different tick types', () => {
    const tickTypes: TickType[] = ['BEAT', 'MEASURE'];
    
    tickTypes.forEach(type => {
      mockBroadcast.mockClear();
      MetronomeClient.tick(type);
      expect(mockBroadcast).toHaveBeenCalledWith('METRONOME_TICK', { type });
    });
  });

  it('should broadcast start message', () => {
    MetronomeClient.start();

    expect(mockGetInstance).toHaveBeenCalled();
    expect(mockBroadcast).toHaveBeenCalledWith('METRONOME_START');
  });

  it('should broadcast stop message', () => {
    MetronomeClient.stop();

    expect(mockGetInstance).toHaveBeenCalled();
    expect(mockBroadcast).toHaveBeenCalledWith('METRONOME_STOP');
  });

  it('should broadcast setBpm with correct bpm value', () => {
    const bpm = 120;
    MetronomeClient.setBpm(bpm);

    expect(mockGetInstance).toHaveBeenCalled();
    expect(mockBroadcast).toHaveBeenCalledWith('SET_BPM', { bpm });
  });

  it('should handle different bpm values', () => {
    const bpmValues = [60, 100, 140, 200];
    
    bpmValues.forEach(bpm => {
      mockBroadcast.mockClear();
      MetronomeClient.setBpm(bpm);
      expect(mockBroadcast).toHaveBeenCalledWith('SET_BPM', { bpm });
    });
  });

  it('should use the same RealTimeController instance for all methods', () => {
    MetronomeClient.tick('BEAT');
    MetronomeClient.start();
    MetronomeClient.stop();
    MetronomeClient.setBpm(100);

    expect(mockGetInstance).toHaveBeenCalledTimes(4);
    expect(mockBroadcast).toHaveBeenCalledTimes(4);
  });
});
