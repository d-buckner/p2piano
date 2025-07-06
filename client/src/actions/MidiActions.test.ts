import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setStore } from '../app/store';
import { setMidiEnabled } from './MidiActions';


// Mock the store
vi.mock('../app/store', () => ({
  setStore: vi.fn(),
}));

const mockSetStore = vi.mocked(setStore);

describe('MidiActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setMidiEnabled', () => {
    it('should set MIDI enabled to true', () => {
      setMidiEnabled(true);
      
      expect(mockSetStore).toHaveBeenCalledWith('midi', 'enabled', true);
    });

    it('should set MIDI enabled to false', () => {
      setMidiEnabled(false);
      
      expect(mockSetStore).toHaveBeenCalledWith('midi', 'enabled', false);
    });
  });
});
