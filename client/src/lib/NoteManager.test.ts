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
});
