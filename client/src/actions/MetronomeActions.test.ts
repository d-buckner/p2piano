import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setStore } from '../app/store';
import { MIN_BPM, MAX_BPM } from '../constants/metronome';
import { setMetronomeActive, setMetronomeBpm, setMetronomeLeader } from './MetronomeActions';


// Mock the store
vi.mock('../app/store', () => ({
  setStore: vi.fn(),
}));

const mockSetStore = vi.mocked(setStore);

describe('MetronomeActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setMetronomeActive', () => {
    it('should set metronome active to true', () => {
      setMetronomeActive(true);
      
      expect(mockSetStore).toHaveBeenCalledWith('metronome', 'active', true);
    });

    it('should set metronome active to false', () => {
      setMetronomeActive(false);
      
      expect(mockSetStore).toHaveBeenCalledWith('metronome', 'active', false);
    });
  });

  describe('setMetronomeBpm', () => {
    it('should set valid BPM value', () => {
      const validBpm = 120;
      setMetronomeBpm(validBpm);
      
      expect(mockSetStore).toHaveBeenCalledWith('metronome', 'bpm', validBpm);
    });

    it('should clamp BPM to minimum value', () => {
      const tooLow = MIN_BPM - 10;
      setMetronomeBpm(tooLow);
      
      expect(mockSetStore).toHaveBeenCalledWith('metronome', 'bpm', MIN_BPM);
    });

    it('should clamp BPM to maximum value', () => {
      const tooHigh = MAX_BPM + 10;
      setMetronomeBpm(tooHigh);
      
      expect(mockSetStore).toHaveBeenCalledWith('metronome', 'bpm', MAX_BPM);
    });

    it('should handle edge case values', () => {
      setMetronomeBpm(MIN_BPM);
      expect(mockSetStore).toHaveBeenCalledWith('metronome', 'bpm', MIN_BPM);

      setMetronomeBpm(MAX_BPM);
      expect(mockSetStore).toHaveBeenCalledWith('metronome', 'bpm', MAX_BPM);
    });
  });

  describe('setMetronomeLeader', () => {
    it('should set metronome leader with valid user ID', () => {
      const leaderId = 'user-123';
      setMetronomeLeader(leaderId);
      
      expect(mockSetStore).toHaveBeenCalledWith('metronome', 'leaderId', leaderId);
    });

    it('should set metronome leader to undefined', () => {
      setMetronomeLeader(undefined);
      
      expect(mockSetStore).toHaveBeenCalledWith('metronome', 'leaderId', undefined);
    });

    it('should set metronome leader to empty string', () => {
      setMetronomeLeader('');
      
      expect(mockSetStore).toHaveBeenCalledWith('metronome', 'leaderId', '');
    });
  });
});