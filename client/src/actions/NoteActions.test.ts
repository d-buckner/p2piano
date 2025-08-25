import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import { getAudioDelay } from '../audio/synchronization/utils';
import PianoClient from '../clients/PianoClient';
import { DEFAULT_VELOCITY } from '../constants';
import { NoteManager } from '../lib/NoteManager';
import { selectUser, selectWorkspace } from '../selectors/workspaceSelectors';
import { keyDown, keyUp, sustainDown, sustainUp } from './NoteActions';
import { getResolvedUserId, getUserColor } from './utils';
import type { Instrument } from '../audio/instruments/Instrument';
import type { User } from '../lib/workspaceTypes';

// Mock dependencies
vi.mock('../lib/NoteManager');
vi.mock('../audio/instruments/InstrumentRegistry');
vi.mock('../audio/synchronization/utils');
vi.mock('../clients/PianoClient');
vi.mock('../selectors/workspaceSelectors');
vi.mock('./utils');

describe('NoteActions', () => {
  const mockInstrument = {
    keyDown: vi.fn(),
    keyUp: vi.fn(),
    sustainDown: vi.fn(),
    sustainUp: vi.fn(),
    type: 'piano'
  } as unknown as Instrument;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocked functions
    vi.mocked(InstrumentRegistry.get).mockReturnValue(mockInstrument);
    vi.mocked(getAudioDelay).mockReturnValue(0);
    vi.mocked(selectUser).mockReturnValue(() => ({ color: '#ff0000' } as User));
    vi.mocked(selectWorkspace).mockReturnValue({ userId: 'current-user-id' });
    vi.mocked(getResolvedUserId).mockReturnValue('current-user-id');
    vi.mocked(getUserColor).mockReturnValue('#ff0000');
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

    it('should start note with correct data', () => {
      const midi = 60;
      const velocity = 100;
      const expectedColor = '#ff0000';
      
      keyDown(midi, velocity);
      
      expect(NoteManager.startNote).toHaveBeenCalledWith(midi, 'current-user-id', expectedColor);
    });

    it('should start note regardless of existing notes', () => {
      const midi = 60;
      const velocity = 100;
      
      keyDown(midi, velocity);
      
      expect(NoteManager.startNote).toHaveBeenCalledWith(midi, 'current-user-id', '#ff0000');
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
      
      vi.mocked(getResolvedUserId).mockReturnValue(peerId);
      vi.mocked(getUserColor).mockReturnValue(remoteUserColor);
      
      const result = keyDown(midi, DEFAULT_VELOCITY, peerId);
      
      expect(InstrumentRegistry.get).toHaveBeenCalledWith(peerId);
      expect(getAudioDelay).toHaveBeenCalledWith(peerId);
      expect(result).toBe(remoteUserColor);
    });

    it('should return undefined when no workspace userId available', () => {
      vi.mocked(getResolvedUserId).mockReturnValue(undefined);
      
      const result = keyDown(60);
      
      expect(result).toBeUndefined();
      expect(InstrumentRegistry.get).not.toHaveBeenCalled();
      expect(NoteManager.startNote).not.toHaveBeenCalled();
    });

    it('should handle missing instrument gracefully', () => {
      vi.mocked(InstrumentRegistry.get).mockReturnValue(null);
      
      const result = keyDown(60);
      
      expect(result).toBeUndefined();
      expect(NoteManager.startNote).not.toHaveBeenCalled();
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

    it('should end note', () => {
      const midi = 60;
      
      keyUp(midi);
      
      expect(NoteManager.endNote).toHaveBeenCalledWith(midi, 'current-user-id');
    });

    it('should always return undefined', () => {
      const result = keyUp(60);
      expect(result).toBeUndefined();
    });

    it('should handle peerId parameter correctly', () => {
      const midi = 60;
      const peerId = 'remote-user';
      
      vi.mocked(getResolvedUserId).mockReturnValue(peerId);
      
      keyUp(midi, peerId);
      
      expect(InstrumentRegistry.get).toHaveBeenCalledWith(peerId);
      expect(getAudioDelay).toHaveBeenCalledWith(peerId);
      expect(NoteManager.endNote).toHaveBeenCalledWith(midi, peerId);
    });

    it('should return undefined when no workspace userId available', () => {
      vi.mocked(getResolvedUserId).mockReturnValue(undefined);
      
      const result = keyUp(60);
      
      expect(result).toBeUndefined();
      expect(InstrumentRegistry.get).not.toHaveBeenCalled();
      expect(NoteManager.endNote).not.toHaveBeenCalled();
    });

    it('should handle missing instrument gracefully', () => {
      vi.mocked(InstrumentRegistry.get).mockReturnValue(null);
      
      expect(() => keyUp(60)).not.toThrow();
      
      expect(NoteManager.endNote).toHaveBeenCalledWith(60, 'current-user-id');
    });
  });

  describe('edge cases', () => {
    it('should handle missing user color', () => {
      vi.mocked(getUserColor).mockReturnValue(undefined);
      
      const result = keyDown(60);
      
      expect(result).toBeUndefined();
      expect(NoteManager.startNote).not.toHaveBeenCalled();
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
      
      vi.mocked(getResolvedUserId).mockReturnValue(peerId);
      
      sustainDown(peerId);
      
      expect(InstrumentRegistry.get).toHaveBeenCalledWith(peerId);
      expect(mockInstrument.sustainDown).toHaveBeenCalled();
    });

    it('should return early when no workspace userId available', () => {
      vi.mocked(getResolvedUserId).mockReturnValue(undefined);
      
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
      
      vi.mocked(getResolvedUserId).mockReturnValue(peerId);
      
      sustainUp(peerId);
      
      expect(InstrumentRegistry.get).toHaveBeenCalledWith(peerId);
      expect(mockInstrument.sustainUp).toHaveBeenCalled();
    });

    it('should return early when no workspace userId available', () => {
      vi.mocked(getResolvedUserId).mockReturnValue(undefined);
      
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
