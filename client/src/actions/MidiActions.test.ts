import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setMidiStore } from '../stores/MidiStore';
import { setMidiEnabled } from './MidiActions';


// Mock the store
vi.mock('../stores/MidiStore', () => ({
  setMidiStore: vi.fn(),
}));

const mockSetMidiStore = vi.mocked(setMidiStore);

describe('MidiActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setMidiEnabled', () => {
    it('should set MIDI enabled to true', () => {
      setMidiEnabled(true);
      
      expect(mockSetMidiStore).toHaveBeenCalledWith('enabled', true);
    });

    it('should set MIDI enabled to false', () => {
      setMidiEnabled(false);
      
      expect(mockSetMidiStore).toHaveBeenCalledWith('enabled', false);
    });
  });
});
