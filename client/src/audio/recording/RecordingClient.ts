import { store } from '../../app/store';
import IndexedDBClient from '../../clients/IndexedDBClient';
import { KeyActions, type Note } from '../../constants';
import { selectUsers } from '../../selectors/workspaceSelectors';
import { RECORDING_DB_CONFIG } from './constants';
import type {
  EventsPageResult,
  KeyDownEvent,
  KeyUpEvent,
  RecordingEvent,
  RecordingMetadata,
  SustainDownEvent,
  SustainUpEvent,
} from './types';
import type { InstrumentType } from '../instruments/Instrument';


export default class RecordingClient {
  private db?: IndexedDBClient;
  private metadata?: RecordingMetadata;
  private readonly tables = {
    EVENTS: 'events',
    METADATA: 'metadata'
  };
  
  constructor(private recordingId: string) { }

  static async getUserRecordings(): Promise<RecordingMetadata[]> {
    const db = await IndexedDBClient.open(RECORDING_DB_CONFIG);
    const recordings = await db.getAll<RecordingMetadata>('metadata');
    db.close();
    
    // Sort by createdAt descending (newest first)
    return recordings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  public async initialize(): Promise<void> {
    this.db = await IndexedDBClient.open(RECORDING_DB_CONFIG);
    
    // Try to load existing metadata
    try {
      this.metadata = await this.db.get<RecordingMetadata>(this.tables.METADATA, this.recordingId);
    } catch {
      // Metadata doesn't exist yet - that's okay for new recordings
    }
  }

  public async createRecording(): Promise<void> {
    this.ensureInitializedDb();
    
    const users = selectUsers(store);
    const createdAt = Date.now(); // UTC timestamp
    this.metadata = {
      id: this.recordingId,
      title: new Date(createdAt).toLocaleString(),
      displayNames: Object.values(users).map(u => u.displayName),
      duration: 0,
      createdAt,
    };
    
    await this.db!.put(this.tables.METADATA, this.metadata);
  }

  public async updateDuration(duration: number) {
    this.ensureInitialized();
    if (!this.metadata) {
      throw new Error('Cannot update duration for recording before it exists');
    }

    this.metadata.duration = duration;
    await this.db!.put(this.tables.METADATA, this.metadata);
  }

  public keyDown(note: Note, instrument: InstrumentType, timestamp: number): void {
    this.ensureInitialized();
    this.db!.add<KeyDownEvent>(this.tables.EVENTS, {
      type: KeyActions.KEY_DOWN,
      recordingId: this.recordingId,
      midi: note.midi,
      velocity: note.velocity,
      color: note.color,
      userId: note.peerId,
      instrument,
      timestamp,
    });
  }

  public keyUp(midi: number, userId: string, timestamp: number): void {
    this.ensureInitialized();
    this.db!.add<KeyUpEvent>(this.tables.EVENTS, {
      type: KeyActions.KEY_UP,
      recordingId: this.recordingId,
      midi,
      userId,
      timestamp,
    });
  }

  public sustainDown(userId: string, timestamp: number): void {
    this.ensureInitialized();
    this.db!.add<SustainDownEvent>(this.tables.EVENTS, {
      type: KeyActions.SUSTAIN_DOWN,
      recordingId: this.recordingId,
      timestamp,
      userId,
    });
  }

  public sustainUp(userId: string, timestamp: number): void {
    this.ensureInitialized();
    this.db!.add<SustainUpEvent>(this.tables.EVENTS, {
      type: KeyActions.SUSTAIN_UP,
      recordingId: this.recordingId,
      timestamp,
      userId,
    });
  }

  public async getEventsByRecording(pageSize = 100, lastTimestamp?: number): Promise<EventsPageResult> {
    this.ensureInitialized();
    
    const result = await this.db!.queryCompoundIndex<RecordingEvent>(
      this.tables.EVENTS,
      'by-recording-timestamp',
      [this.recordingId],
      { pageSize, startAfter: lastTimestamp }
    );
    
    return {
      events: result.items,
      hasMore: result.hasMore,
      lastTimestamp: result.items.length > 0
        ? result.items[result.items.length - 1].timestamp
        : undefined
    };
  }

  public async deleteRecording(): Promise<void> {
    this.ensureInitializedDb();
    
    // Delete all events for this recording using the recordingId index
    await this.db!.deleteByIndex(this.tables.EVENTS, 'recordingId', this.recordingId);
    
    // Delete the metadata
    await this.db!.delete(this.tables.METADATA, this.recordingId);
  }

  public async updateTitle(newTitle: string): Promise<void> {
    this.ensureInitialized();
    
    if (!this.metadata) {
      throw new Error('Cannot update title for recording before it exists');
    }

    this.metadata.title = newTitle;
    await this.db!.put(this.tables.METADATA, this.metadata);
  }

  public close(): void {
    this.db?.close();
  }

  private ensureInitializedDb() {
    if (!this.db) {
      throw new Error('Database not initialized - call initialize() first');
    }
  }

  private ensureInitialized() {
    if (!this.db || !this.metadata) {
      throw new Error('Cannot record events before the recording has been created');
    }
  }
}
