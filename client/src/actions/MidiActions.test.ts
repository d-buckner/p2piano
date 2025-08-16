import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setMidiStore } from '../stores/MidiStore';
import { disableMidi } from './MidiActions';


// Mock the store
vi.mock('../stores/MidiStore', () => ({
  setMidiStore: vi.fn(),
  midiStore: {
    inputs: [],
    enabled: false,
    hasAccess: false,
    selectedInput: null,
  },
}));

const mockSetMidiStore = vi.mocked(setMidiStore);

describe('MidiActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('disableMidi', () => {
    it('should disable MIDI', () => {
      disableMidi();
      
      expect(mockSetMidiStore).toHaveBeenCalledWith('enabled', false);
    });
  });
});
