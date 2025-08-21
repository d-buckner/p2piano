import { store } from '../../app/store';
import IndexDBClient, { type IndexDBConfig } from '../../clients/IndexDBClient';
import { KeyActions, type Note } from '../../constants';
import { selectUsers } from '../../selectors/workspaceSelectors';
import type {
  KeyDownEvent,
  KeyUpEvent,
  RecordingEvent,
  SustainDownEvent,
  SustainUpEvent,
} from './types';
import type { InstrumentType } from '../instruments/Instrument';


export default class RecordingClient {
  private db?: IndexDBClient;
  private readonly dbName = 'recordings';
  private readonly tables = {
    EVENTS: 'events',
    METADATA: 'metadata'
  };
  
  constructor(private recordingId: string) { }

  public async initialize(): Promise<void> {
    const config: IndexDBConfig = {
      dbName: this.dbName,
      version: 1,
      objectStores: [
        {
          name: this.tables.METADATA,
          keyPath: 'id',
        },
        {
          name: this.tables.EVENTS,
          keyPath: 'eventId',
          autoIncrement: true,
          indexes: [
            { name: 'recordingId', keyPath: 'recordingId', unique: false },
            { name: 'timestamp', keyPath: 'timestamp', unique: false },
          ],
        },
      ],
    } as const;

    this.db = await IndexDBClient.open(config);
    const users = selectUsers(store);
    await this.db.put(this.tables.METADATA, {
      id: this.recordingId,
      title: new Date().toLocaleString(),
      displayNames: Object.values(users).map(u => u.displayName),
    });
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

  // gets all events for this recording, sorted by timestamp ascending
  public async getNextEventBatch(): Promise<RecordingEvent[]> {
    this.ensureInitialized();
    
    // Get all events for this recording
    const allEvents = await this.db!.getAll<RecordingEvent>(this.tables.EVENTS);
    
    // Filter by recordingId and sort by timestamp
    const filteredEvents = allEvents
      .filter(event => event.recordingId === this.recordingId)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    return filteredEvents;
  }

  public close(): void {
    this.db?.close();
  }

  private ensureInitialized() {
    if (!this.db) {
      throw new Error('Cannot record events before database is initialized');
    }
  }
}
