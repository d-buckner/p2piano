type EventListener<T = unknown> = (data: T) => void;

const NOTE_EVENTS = {
  START: 'note:start',
  END: 'note:end',
} as const;

interface NoteStartEvent {
  midi: number;
  userId: string;
  color: string;
}

interface NoteEndEvent {
  midi: number;
  userId: string;
}


export class NoteManager {
  private static listeners = new Map<string, Set<EventListener>>();
  private static activeNotes = new Map<string, Set<number>>(); // userId -> Set<midi>

  public static onNoteStart(listener: EventListener<NoteStartEvent>): void {
    if (!this.listeners.has(NOTE_EVENTS.START)) {
      this.listeners.set(NOTE_EVENTS.START, new Set());
    }
    this.listeners.get(NOTE_EVENTS.START)!.add(listener);
  }

  public static onNoteEnd(listener: EventListener<NoteEndEvent>): void {
    if (!this.listeners.has(NOTE_EVENTS.END)) {
      this.listeners.set(NOTE_EVENTS.END, new Set());
    }
    this.listeners.get(NOTE_EVENTS.END)!.add(listener);
  }

  private static emit(event: string, data: NoteStartEvent | NoteEndEvent): void {
    this.listeners.get(event)?.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  public static offNoteStart(listener: EventListener<NoteStartEvent>): void {
    this.listeners.get(NOTE_EVENTS.START)?.delete(listener);
  }

  public static offNoteEnd(listener: EventListener<NoteEndEvent>): void {
    this.listeners.get(NOTE_EVENTS.END)?.delete(listener);
  }

  public static removeAllListeners(): void {
    this.listeners.clear();
  }

  public static startNote(midi: number, userId: string, color: string): void {
    if (!this.activeNotes.has(userId)) {
      this.activeNotes.set(userId, new Set());
    }
    this.activeNotes.get(userId)!.add(midi);
    this.emit(NOTE_EVENTS.START, { midi, userId, color });
  }

  public static endNote(midi: number, userId: string): void {
    const userNotes = this.activeNotes.get(userId);
    if (userNotes) {
      userNotes.delete(midi);
      if (userNotes.size === 0) {
        this.activeNotes.delete(userId);
      }
    }
    this.emit(NOTE_EVENTS.END, { midi, userId });
  }

  public static releaseAllNotesForUser(userId: string): void {
    const userNotes = this.activeNotes.get(userId);
    if (userNotes) {
      const notesToRelease = Array.from(userNotes);
      notesToRelease.forEach(midi => {
        this.endNote(midi, userId);
      });
    }
  }
}
