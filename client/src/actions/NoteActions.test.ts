import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setStore } from '../app/store';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import { getAudioDelay } from '../audio/syncronization/utils';
import PianoClient from '../clients/PianoClient';
import { DEFAULT_VELOCITY, type Note } from '../constants';
import { selectUser, selectWorkspace } from '../selectors/workspaceSelectors';
import { keyDown, keyUp, sustainDown, sustainUp } from './NoteActions';

// Mock dependencies
vi.mock('../app/store', () => ({
  store: {},
  setStore: vi.fn(),
}));

vi.mock('../audio/instruments/InstrumentRegistry', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../audio/syncronization/utils', () => ({
  getAudioDelay: vi.fn(() => 0),
}));

vi.mock('../clients/PianoClient', () => ({
  default: {
    keyDown: vi.fn(),
    keyUp: vi.fn(),
    sustainDown: vi.fn(),
    sustainUp: vi.fn(),
  },
}));

vi.mock('../selectors/workspaceSelectors', () => ({
  selectUser: vi.fn(() => () => ({ color: '#ff0000' })),
  selectWorkspace: vi.fn(() => ({ userId: 'current-user-id' })),
}));

describe('NoteActions', () => {
  const mockInstrument = {
    keyDown: vi.fn(),
    keyUp: vi.fn(),
    sustainDown: vi.fn(),
    sustainUp: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(InstrumentRegistry.get).mockReturnValue(mockInstrument);
    vi.mocked(getAudioDelay).mockReturnValue(0);
    vi.mocked(selectUser).mockReturnValue(() => ({ color: '#ff0000' }));
    vi.mocked(selectWorkspace).mockReturnValue({ userId: 'current-user-id' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('keyDown()', () => {
    it('should send network message when no peerId provided', () => {
      const midi = 60;
      const velocity = 127;
      
      keyDown(midi, velocity);
      
      expect(PianoClient.keyDown).toHaveBeenCalledWith(midi, velocity);
    });

    it('should not send network message when peerId provided', () => {
      const midi = 60;
      const velocity = 127;
      const peerId = 'remote-user';
      
      keyDown(midi, velocity, peerId);
      
      expect(PianoClient.keyDown).not.toHaveBeenCalled();
    });

    it('should use default velocity when not provided', () => {
      const midi = 60;
      
      keyDown(midi);
      
      expect(PianoClient.keyDown).toHaveBeenCalledWith(midi, DEFAULT_VELOCITY);
    });

    it('should trigger instrument keyDown with correct parameters', () => {
      const midi = 60;
      const velocity = 100;
      const expectedDelay = 50;
      
      vi.mocked(getAudioDelay).mockReturnValue(expectedDelay);
      
      keyDown(midi, velocity);
      
      expect(InstrumentRegistry.get).toHaveBeenCalledWith('current-user-id');
      expect(mockInstrument.keyDown).toHaveBeenCalledWith(midi, expectedDelay, velocity);
    });

    it('should add note to store with correct data', () => {
      const midi = 60;
      const velocity = 100;
      const expectedColor = '#ff0000';
      
      keyDown(midi, velocity);
      
      expect(setStore).toHaveBeenCalledWith('notesByMidi', '60', expect.any(Function));
      
      const updateFunction = vi.mocked(setStore).mock.calls[0][2];
      const existingNotes: Note[] = [];
      const result = updateFunction(existingNotes);
      
      expect(result).toEqual([{
        midi,
        peerId: 'current-user-id',
        velocity,
        color: expectedColor,
      }]);
    });

    it('should update existing note for same user', () => {
      const midi = 60;
      const velocity = 100;
      const existingNotes = [
        { midi: 60, peerId: 'current-user-id', velocity: 80, color: '#ff0000' },
        { midi: 60, peerId: 'other-user', velocity: 90, color: '#00ff00' },
      ];
      
      keyDown(midi, velocity);
      
      const updateFunction = vi.mocked(setStore).mock.calls[0][2];
      const result = updateFunction(existingNotes);
      
      expect(result).toEqual([
        { midi: 60, peerId: 'current-user-id', velocity: 100, color: '#ff0000' },
        { midi: 60, peerId: 'other-user', velocity: 90, color: '#00ff00' },
      ]);
    });

    it('should return user color for visualization', () => {
      const midi = 60;
      const expectedColor = '#ff0000';
      
      const result = keyDown(midi);
      
      expect(result).toBe(expectedColor);
    });

    it('should handle peerId parameter correctly', () => {
      const midi = 60;
      const peerId = 'remote-user';
      const remoteUserColor = '#00ff00';
      
      vi.mocked(selectUser).mockReturnValue(() => ({ color: remoteUserColor }));
      
      const result = keyDown(midi, DEFAULT_VELOCITY, peerId);
      
      expect(InstrumentRegistry.get).toHaveBeenCalledWith(peerId);
      expect(getAudioDelay).toHaveBeenCalledWith(peerId);
      expect(result).toBe(remoteUserColor);
    });

    it('should return undefined when no workspace userId available', () => {
      vi.mocked(selectWorkspace).mockReturnValue({ userId: undefined });
      
      const result = keyDown(60);
      
      expect(result).toBeUndefined();
      expect(InstrumentRegistry.get).not.toHaveBeenCalled();
      expect(setStore).not.toHaveBeenCalled();
    });

    it('should handle missing instrument gracefully', () => {
      vi.mocked(InstrumentRegistry.get).mockReturnValue(null);
      
      expect(() => keyDown(60)).not.toThrow();
      
      expect(setStore).toHaveBeenCalled();
    });
  });

  describe('keyUp()', () => {
    it('should send network message when no peerId provided', () => {
      const midi = 60;
      
      keyUp(midi);
      
      expect(PianoClient.keyUp).toHaveBeenCalledWith(midi);
    });

    it('should not send network message when peerId provided', () => {
      const midi = 60;
      const peerId = 'remote-user';
      
      keyUp(midi, peerId);
      
      expect(PianoClient.keyUp).not.toHaveBeenCalled();
    });

    it('should trigger instrument keyUp with correct parameters', () => {
      const midi = 60;
      const expectedDelay = 50;
      
      vi.mocked(getAudioDelay).mockReturnValue(expectedDelay);
      
      keyUp(midi);
      
      expect(InstrumentRegistry.get).toHaveBeenCalledWith('current-user-id');
      expect(mockInstrument.keyUp).toHaveBeenCalledWith(midi, expectedDelay);
    });

    it('should remove note from store', () => {
      const midi = 60;
      
      keyUp(midi);
      
      expect(setStore).toHaveBeenCalledWith('notesByMidi', '60', expect.any(Function));
    });

    it('should filter out correct user note from store', () => {
      const midi = 60;
      const existingNotes = [
        { midi: 60, peerId: 'current-user-id', velocity: 80, color: '#ff0000' },
        { midi: 60, peerId: 'other-user', velocity: 90, color: '#00ff00' },
      ];
      
      keyUp(midi);
      
      const updateFunction = vi.mocked(setStore).mock.calls[0][2];
      const result = updateFunction(existingNotes);
      
      expect(result).toEqual([
        { midi: 60, peerId: 'other-user', velocity: 90, color: '#00ff00' },
      ]);
    });

    it('should return undefined when no notes remain', () => {
      const midi = 60;
      const existingNotes = [
        { midi: 60, peerId: 'current-user-id', velocity: 80, color: '#ff0000' },
      ];
      
      keyUp(midi);
      
      const updateFunction = vi.mocked(setStore).mock.calls[0][2];
      const result = updateFunction(existingNotes);
      
      expect(result).toBeUndefined();
    });

    it('should always return undefined', () => {
      const result = keyUp(60);
      expect(result).toBeUndefined();
    });

    it('should handle peerId parameter correctly', () => {
      const midi = 60;
      const peerId = 'remote-user';
      
      keyUp(midi, peerId);
      
      expect(InstrumentRegistry.get).toHaveBeenCalledWith(peerId);
      expect(getAudioDelay).toHaveBeenCalledWith(peerId);
    });

    it('should return undefined when no workspace userId available', () => {
      vi.mocked(selectWorkspace).mockReturnValue({ userId: undefined });
      
      const result = keyUp(60);
      
      expect(result).toBeUndefined();
      expect(InstrumentRegistry.get).not.toHaveBeenCalled();
      expect(setStore).not.toHaveBeenCalled();
    });

    it('should handle missing instrument gracefully', () => {
      vi.mocked(InstrumentRegistry.get).mockReturnValue(null);
      
      expect(() => keyUp(60)).not.toThrow();
      
      expect(setStore).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty existing notes array in keyDown', () => {
      keyDown(60);
      
      const updateFunction = vi.mocked(setStore).mock.calls[0][2];
      const result = updateFunction(undefined);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        midi: 60,
        peerId: 'current-user-id',
      });
    });

    it('should handle empty existing notes array in keyUp', () => {
      keyUp(60);
      
      const updateFunction = vi.mocked(setStore).mock.calls[0][2];
      const result = updateFunction([]);
      
      expect(result).toBeUndefined();
    });

    it('should handle missing user color', () => {
      vi.mocked(selectUser).mockReturnValue(() => ({ color: undefined }));
      
      const result = keyDown(60);
      
      expect(result).toBeUndefined();
    });
  });

  describe('sustainDown()', () => {
    it('should send network message when no peerId provided', () => {
      sustainDown();
      
      expect(PianoClient.sustainDown).toHaveBeenCalled();
    });

    it('should not send network message when peerId provided', () => {
      const peerId = 'remote-user';
      
      sustainDown(peerId);
      
      expect(PianoClient.sustainDown).not.toHaveBeenCalled();
    });

    it('should trigger instrument sustainDown with current user', () => {
      sustainDown();
      
      expect(InstrumentRegistry.get).toHaveBeenCalledWith('current-user-id');
      expect(mockInstrument.sustainDown).toHaveBeenCalled();
    });

    it('should trigger instrument sustainDown with provided peerId', () => {
      const peerId = 'remote-user';
      
      sustainDown(peerId);
      
      expect(InstrumentRegistry.get).toHaveBeenCalledWith(peerId);
      expect(mockInstrument.sustainDown).toHaveBeenCalled();
    });

    it('should return early when no workspace userId available', () => {
      vi.mocked(selectWorkspace).mockReturnValue({ userId: undefined });
      
      sustainDown();
      
      expect(InstrumentRegistry.get).not.toHaveBeenCalled();
      expect(mockInstrument.sustainDown).not.toHaveBeenCalled();
    });

    it('should handle missing instrument gracefully', () => {
      vi.mocked(InstrumentRegistry.get).mockReturnValue(null);
      
      expect(() => sustainDown()).not.toThrow();
      
      expect(InstrumentRegistry.get).toHaveBeenCalled();
    });

    it('should handle instrument without sustainDown method', () => {
      const instrumentWithoutSustain = {
        keyDown: vi.fn(),
        keyUp: vi.fn(),
        releaseAll: vi.fn(),
      };
      vi.mocked(InstrumentRegistry.get).mockReturnValue(instrumentWithoutSustain);
      
      expect(() => sustainDown()).not.toThrow();
    });
  });

  describe('sustainUp()', () => {
    it('should send network message when no peerId provided', () => {
      sustainUp();
      
      expect(PianoClient.sustainUp).toHaveBeenCalled();
    });

    it('should not send network message when peerId provided', () => {
      const peerId = 'remote-user';
      
      sustainUp(peerId);
      
      expect(PianoClient.sustainUp).not.toHaveBeenCalled();
    });

    it('should trigger instrument sustainUp with current user', () => {
      sustainUp();
      
      expect(InstrumentRegistry.get).toHaveBeenCalledWith('current-user-id');
      expect(mockInstrument.sustainUp).toHaveBeenCalled();
    });

    it('should trigger instrument sustainUp with provided peerId', () => {
      const peerId = 'remote-user';
      
      sustainUp(peerId);
      
      expect(InstrumentRegistry.get).toHaveBeenCalledWith(peerId);
      expect(mockInstrument.sustainUp).toHaveBeenCalled();
    });

    it('should return early when no workspace userId available', () => {
      vi.mocked(selectWorkspace).mockReturnValue({ userId: undefined });
      
      sustainUp();
      
      expect(InstrumentRegistry.get).not.toHaveBeenCalled();
      expect(mockInstrument.sustainUp).not.toHaveBeenCalled();
    });

    it('should handle missing instrument gracefully', () => {
      vi.mocked(InstrumentRegistry.get).mockReturnValue(null);
      
      expect(() => sustainUp()).not.toThrow();
      
      expect(InstrumentRegistry.get).toHaveBeenCalled();
    });

    it('should handle instrument without sustainUp method', () => {
      const instrumentWithoutSustain = {
        keyDown: vi.fn(),
        keyUp: vi.fn(),
        releaseAll: vi.fn(),
      };
      vi.mocked(InstrumentRegistry.get).mockReturnValue(instrumentWithoutSustain);
      
      expect(() => sustainUp()).not.toThrow();
    });
  });
});
