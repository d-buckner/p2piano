import { describe, it, expect, vi, beforeEach } from 'vitest';
import RealTimeController from '../networking/RealTimeController';
import PianoClient from './PianoClient';


type MockRealTimeController = {
  broadcast: vi.Mock<[string, unknown], void>;
  sendToPeer: vi.Mock<[string, string, unknown], void>;
};

// Mock RealTimeController
vi.mock('../networking/RealTimeController');

describe('PianoClient', () => {
  let mockRealTimeController: MockRealTimeController;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRealTimeController = {
      broadcast: vi.fn(),
    };
    vi.mocked(RealTimeController.getInstance).mockReturnValue(mockRealTimeController);
  });

  describe('keyDown', () => {
    it('should broadcast KEY_DOWN event with note and velocity', () => {
      PianoClient.keyDown(60, 127);

      expect(mockRealTimeController.broadcast).toHaveBeenCalledWith('KEY_DOWN', {
        note: 60,
        velocity: 127,
      });
    });

    it('should handle different MIDI notes', () => {
      const testCases = [
        { note: 21, velocity: 64 },  // A0 - lowest piano key
        { note: 60, velocity: 127 }, // C4 - middle C
        { note: 108, velocity: 1 },  // C8 - highest piano key
      ];

      testCases.forEach(({ note, velocity }) => {
        PianoClient.keyDown(note, velocity);
        
        expect(mockRealTimeController.broadcast).toHaveBeenCalledWith('KEY_DOWN', {
          note,
          velocity,
        });
      });

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(3);
    });

    it('should handle velocity range', () => {
      const velocityTestCases = [
        0,    // No velocity
        1,    // Minimum velocity
        64,   // Medium velocity
        127,  // Maximum velocity
      ];

      velocityTestCases.forEach((velocity) => {
        PianoClient.keyDown(60, velocity);
        
        expect(mockRealTimeController.broadcast).toHaveBeenCalledWith('KEY_DOWN', {
          note: 60,
          velocity,
        });
      });

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(4);
    });

    it('should handle edge case MIDI values', () => {
      // Test boundary values
      PianoClient.keyDown(0, 127);   // MIDI note 0
      PianoClient.keyDown(127, 64);  // MIDI note 127
      
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(1, 'KEY_DOWN', {
        note: 0,
        velocity: 127,
      });
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(2, 'KEY_DOWN', {
        note: 127,
        velocity: 64,
      });
    });

    it('should handle rapid key presses', () => {
      // Simulate rapid key presses like a fast musical passage
      const rapidNotes = [60, 62, 64, 65, 67, 69, 71, 72]; // C major scale
      
      rapidNotes.forEach((note, index) => {
        PianoClient.keyDown(note, 80 + index); // Varying velocities
      });

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(8);
      rapidNotes.forEach((note, index) => {
        expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(index + 1, 'KEY_DOWN', {
          note,
          velocity: 80 + index,
        });
      });
    });

    it('should handle same note pressed multiple times', () => {
      // Test key repeat behavior
      PianoClient.keyDown(60, 100);
      PianoClient.keyDown(60, 90);
      PianoClient.keyDown(60, 110);

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(3);
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(1, 'KEY_DOWN', {
        note: 60,
        velocity: 100,
      });
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(2, 'KEY_DOWN', {
        note: 60,
        velocity: 90,
      });
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(3, 'KEY_DOWN', {
        note: 60,
        velocity: 110,
      });
    });
  });

  describe('keyUp', () => {
    it('should broadcast KEY_UP event with note only', () => {
      PianoClient.keyUp(60);

      expect(mockRealTimeController.broadcast).toHaveBeenCalledWith('KEY_UP', {
        note: 60,
      });
    });

    it('should handle different MIDI notes for key up', () => {
      const testNotes = [21, 36, 48, 60, 72, 84, 96, 108];

      testNotes.forEach((note) => {
        PianoClient.keyUp(note);
        
        expect(mockRealTimeController.broadcast).toHaveBeenCalledWith('KEY_UP', {
          note,
        });
      });

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(8);
    });

    it('should handle edge case MIDI values for key up', () => {
      PianoClient.keyUp(0);
      PianoClient.keyUp(127);
      
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(1, 'KEY_UP', {
        note: 0,
      });
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(2, 'KEY_UP', {
        note: 127,
      });
    });

    it('should handle rapid key releases', () => {
      const notes = [60, 62, 64, 65, 67];
      
      notes.forEach((note) => {
        PianoClient.keyUp(note);
      });

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(5);
      notes.forEach((note, index) => {
        expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(index + 1, 'KEY_UP', {
          note,
        });
      });
    });

    it('should handle same note released multiple times', () => {
      PianoClient.keyUp(60);
      PianoClient.keyUp(60);
      PianoClient.keyUp(60);

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(3);
      // All calls should be identical
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(1, 'KEY_UP', { note: 60 });
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(2, 'KEY_UP', { note: 60 });
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(3, 'KEY_UP', { note: 60 });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete key press cycle', () => {
      // Press key
      PianoClient.keyDown(60, 100);
      
      // Release key
      PianoClient.keyUp(60);

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(2);
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(1, 'KEY_DOWN', {
        note: 60,
        velocity: 100,
      });
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(2, 'KEY_UP', {
        note: 60,
      });
    });

    it('should handle chord playing', () => {
      // Play C major chord (C-E-G)
      const chord = [60, 64, 67];
      const velocity = 90;

      // Press all keys in chord
      chord.forEach(note => {
        PianoClient.keyDown(note, velocity);
      });

      // Release all keys in chord
      chord.forEach(note => {
        PianoClient.keyUp(note);
      });

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(6);
      
      // Verify key downs
      chord.forEach((note, index) => {
        expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(index + 1, 'KEY_DOWN', {
          note,
          velocity,
        });
      });
      
      // Verify key ups
      chord.forEach((note, index) => {
        expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(index + 4, 'KEY_UP', {
          note,
        });
      });
    });

    it('should handle complex musical passage', () => {
      // Simulate playing a musical phrase with overlapping notes
      const passage = [
        { action: 'down', note: 60, velocity: 80 },
        { action: 'down', note: 62, velocity: 85 },
        { action: 'up', note: 60 },
        { action: 'down', note: 64, velocity: 90 },
        { action: 'up', note: 62 },
        { action: 'down', note: 65, velocity: 75 },
        { action: 'up', note: 64 },
        { action: 'up', note: 65 },
      ];

      passage.forEach(({ action, note, velocity }) => {
        if (action === 'down') {
          PianoClient.keyDown(note, velocity!);
        } else {
          PianoClient.keyUp(note);
        }
      });

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(8);
    });

    it('should handle sustain pedal simulation', () => {
      // Play notes while "sustain pedal is down" (notes don't get key up immediately)
      const sustainedNotes = [60, 64, 67]; // C major chord
      
      sustainedNotes.forEach(note => {
        PianoClient.keyDown(note, 100);
      });

      // Simulate other notes being played over the sustained chord
      PianoClient.keyDown(72, 80); // High C
      PianoClient.keyUp(72);

      // Finally release the sustained chord
      sustainedNotes.forEach(note => {
        PianoClient.keyUp(note);
      });

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(8); // 3 down + 1 down + 1 up + 3 up
    });

    it('should handle sustain pedal events', () => {
      // Test sustain down followed by sustain up
      PianoClient.sustainDown();
      PianoClient.sustainUp();

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(2);
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(1, 'SUSTAIN_DOWN');
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(2, 'SUSTAIN_UP');
    });

    it('should maintain event ordering', () => {
      const events = [
        () => PianoClient.keyDown(60, 100),
        () => PianoClient.keyDown(64, 95),
        () => PianoClient.keyUp(60),
        () => PianoClient.keyDown(67, 105),
        () => PianoClient.keyUp(64),
        () => PianoClient.keyUp(67),
      ];

      events.forEach(event => event());

      // Verify that events were broadcast in the exact order they were called
      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(6);
      
      const calls = mockRealTimeController.broadcast.mock.calls;
      expect(calls[0]).toEqual(['KEY_DOWN', { note: 60, velocity: 100 }]);
      expect(calls[1]).toEqual(['KEY_DOWN', { note: 64, velocity: 95 }]);
      expect(calls[2]).toEqual(['KEY_UP', { note: 60 }]);
      expect(calls[3]).toEqual(['KEY_DOWN', { note: 67, velocity: 105 }]);
      expect(calls[4]).toEqual(['KEY_UP', { note: 64 }]);
      expect(calls[5]).toEqual(['KEY_UP', { note: 67 }]);
    });
  });

  describe('sustainDown', () => {
    it('should broadcast SUSTAIN_DOWN event', () => {
      PianoClient.sustainDown();

      expect(mockRealTimeController.broadcast).toHaveBeenCalledWith('SUSTAIN_DOWN');
    });

    it('should handle multiple sustain down events', () => {
      PianoClient.sustainDown();
      PianoClient.sustainDown();
      PianoClient.sustainDown();

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(3);
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(1, 'SUSTAIN_DOWN');
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(2, 'SUSTAIN_DOWN');
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(3, 'SUSTAIN_DOWN');
    });
  });

  describe('sustainUp', () => {
    it('should broadcast SUSTAIN_UP event', () => {
      PianoClient.sustainUp();

      expect(mockRealTimeController.broadcast).toHaveBeenCalledWith('SUSTAIN_UP');
    });

    it('should handle multiple sustain up events', () => {
      PianoClient.sustainUp();
      PianoClient.sustainUp();

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(2);
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(1, 'SUSTAIN_UP');
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(2, 'SUSTAIN_UP');
    });
  });

  describe('sustain pedal integration', () => {
    it('should handle complete sustain pedal cycle', () => {
      PianoClient.sustainDown();
      PianoClient.sustainUp();

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(2);
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(1, 'SUSTAIN_DOWN');
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(2, 'SUSTAIN_UP');
    });

    it('should handle sustain with note playing', () => {
      // Sustain down, play notes, sustain up
      PianoClient.sustainDown();
      PianoClient.keyDown(60, 100);
      PianoClient.keyDown(64, 100);
      PianoClient.keyUp(60);
      PianoClient.keyUp(64);
      PianoClient.sustainUp();

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(6);
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(1, 'SUSTAIN_DOWN');
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(2, 'KEY_DOWN', { note: 60, velocity: 100 });
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(3, 'KEY_DOWN', { note: 64, velocity: 100 });
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(4, 'KEY_UP', { note: 60 });
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(5, 'KEY_UP', { note: 64 });
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(6, 'SUSTAIN_UP');
    });

    it('should handle sustain without release', () => {
      // Sustain down but never up (like holding pedal)
      PianoClient.sustainDown();
      PianoClient.keyDown(60, 100);
      PianoClient.keyUp(60);

      expect(mockRealTimeController.broadcast).toHaveBeenCalledTimes(3);
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(1, 'SUSTAIN_DOWN');
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(2, 'KEY_DOWN', { note: 60, velocity: 100 });
      expect(mockRealTimeController.broadcast).toHaveBeenNthCalledWith(3, 'KEY_UP', { note: 60 });
    });
  });

  describe('error handling', () => {
    it('should handle RealTimeController broadcast failure gracefully', () => {
      mockRealTimeController.broadcast.mockImplementation(() => {
        throw new Error('Network error');
      });

      // PianoClient doesn't have try-catch, so errors will bubble up
      // This documents the current behavior - errors are not caught
      expect(() => PianoClient.keyDown(60, 100)).toThrow('Network error');
      expect(() => PianoClient.keyUp(60)).toThrow('Network error');
      expect(() => PianoClient.sustainDown()).toThrow('Network error');
      expect(() => PianoClient.sustainUp()).toThrow('Network error');
    });

    it('should handle missing RealTimeController instance', () => {
      vi.mocked(RealTimeController.getInstance).mockImplementation(() => {
        throw new Error('RealTimeController not initialized');
      });

      // Same as above - PianoClient doesn't handle these errors
      expect(() => PianoClient.keyDown(60, 100)).toThrow('RealTimeController not initialized');
      expect(() => PianoClient.keyUp(60)).toThrow('RealTimeController not initialized');
      expect(() => PianoClient.sustainDown()).toThrow('RealTimeController not initialized');
      expect(() => PianoClient.sustainUp()).toThrow('RealTimeController not initialized');
    });
  });
});
