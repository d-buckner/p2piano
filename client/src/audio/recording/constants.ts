import type { IndexedDBConfig } from '../../clients/IndexedDBClient';


export const RECORDING_DB_CONFIG: IndexedDBConfig = {
  dbName: 'recordings',
  version: 1,
  objectStores: [
    {
      name: 'metadata',
      keyPath: 'id',
    },
    {
      name: 'events',
      keyPath: 'eventId',
      autoIncrement: true,
      indexes: [
        { name: 'recordingId', keyPath: 'recordingId', unique: false },
        { name: 'timestamp', keyPath: 'timestamp', unique: false },
        { name: 'by-recording-timestamp', keyPath: ['recordingId', 'timestamp'], unique: false },
      ],
    },
  ],
} as const;
