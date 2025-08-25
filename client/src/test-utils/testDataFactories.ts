import { InstrumentType } from '../audio/instruments/Instrument';
import type { Room, User } from '../lib/workspaceTypes';


export const createTestUser = (overrides: Partial<User> = {}): User => ({
  userId: 'test-user-123',
  displayName: 'Test User',
  color: '#007acc',
  instrument: InstrumentType.PIANO,
  ...overrides,
});

export const createTestRoom = (overrides: Partial<Room> = {}): Room => ({
  roomId: 'test-room-123',
  users: {
    'user1': createTestUser({ userId: 'user1', instrument: InstrumentType.PIANO }),
    'user2': createTestUser({ userId: 'user2', instrument: InstrumentType.SYNTH }),
  },
  ...overrides,
});

export const createTestNote = (overrides: Partial<{
  midi: number;
  peerId: string;
  velocity?: number;
}> = {}) => ({
  midi: 60,
  peerId: 'test-user-123',
  velocity: 80,
  ...overrides,
});

export const createTestWorkspace = (overrides: Partial<{
  room: Room | null;
  userId: string | null;
}> = {}) => ({
  room: null,
  userId: null,
  ...overrides,
});

export const createTestConnectionState = (overrides: Partial<{
  peers: Record<string, unknown>;
  isConnected: boolean;
}> = {}) => ({
  peers: {},
  isConnected: false,
  ...overrides,
});
