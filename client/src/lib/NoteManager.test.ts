import { describe, it, expect, vi } from 'vitest';
import { NoteManager } from './NoteManager';


describe('NoteManager', () => {
  it('should emit and listen to note events', () => {
    const startHandler = vi.fn();
    const endHandler = vi.fn();

    NoteManager.onNoteStart(startHandler);
    NoteManager.onNoteEnd(endHandler);

    NoteManager.startNote(60, 'user1', 'blue');
    NoteManager.endNote(60, 'user1');

    expect(startHandler).toHaveBeenCalledWith({ midi: 60, userId: 'user1', color: 'blue' });
    expect(endHandler).toHaveBeenCalledWith({ midi: 60, userId: 'user1' });

    NoteManager.offNoteStart(startHandler);
    NoteManager.offNoteEnd(endHandler);
  });

  it('should remove listeners with off method', () => {
    const handler = vi.fn();

    NoteManager.onNoteStart(handler);
    NoteManager.startNote(60, 'user1', 'blue');
    expect(handler).toHaveBeenCalledTimes(1);

    NoteManager.offNoteStart(handler);
    NoteManager.startNote(61, 'user1', 'red');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should handle errors in event listeners gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const faultyHandler = vi.fn().mockImplementation(() => {
      throw new Error('Handler error');
    });
    const goodHandler = vi.fn();

    NoteManager.onNoteStart(faultyHandler);
    NoteManager.onNoteStart(goodHandler);

    NoteManager.startNote(60, 'user1', 'blue');

    expect(faultyHandler).toHaveBeenCalled();
    expect(goodHandler).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should remove all listeners', () => {
    const startHandler = vi.fn();
    const endHandler = vi.fn();

    NoteManager.onNoteStart(startHandler);
    NoteManager.onNoteEnd(endHandler);

    NoteManager.removeAllListeners();

    NoteManager.startNote(60, 'user1', 'blue');
    NoteManager.endNote(60, 'user1');

    expect(startHandler).not.toHaveBeenCalled();
    expect(endHandler).not.toHaveBeenCalled();
  });

  it('should release all notes for a user', () => {
    const endHandler = vi.fn();
    NoteManager.onNoteEnd(endHandler);

    NoteManager.startNote(60, 'user1', 'blue');
    NoteManager.startNote(62, 'user1', 'red');
    NoteManager.startNote(64, 'user1', 'green');

    NoteManager.releaseAllNotesForUser('user1');

    expect(endHandler).toHaveBeenCalledWith({ midi: 60, userId: 'user1' });
    expect(endHandler).toHaveBeenCalledWith({ midi: 62, userId: 'user1' });
    expect(endHandler).toHaveBeenCalledWith({ midi: 64, userId: 'user1' });
  });

  it('should handle releasing notes for non-existent user', () => {
    const endHandler = vi.fn();
    NoteManager.onNoteEnd(endHandler);

    NoteManager.releaseAllNotesForUser('non-existent');

    expect(endHandler).not.toHaveBeenCalled();
  });
});
