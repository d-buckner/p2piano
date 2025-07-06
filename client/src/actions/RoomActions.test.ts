import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setStore } from '../app/store';
import { setRoom, setUserId } from './RoomActions';
import type { Room, User } from '../lib/workspaceTypes';

// Mock the store
vi.mock('../app/store', () => ({
  setStore: vi.fn(),
}));

describe('RoomActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setRoom', () => {
    it('should set room with complete room data', () => {
      const mockRoom: Room = {
        roomId: 'room-123',
        name: 'Test Room',
        users: {
          'user-1': {
            userId: 'user-1',
            displayName: 'Alice',
            instrument: 'piano',
          },
          'user-2': {
            userId: 'user-2',
            displayName: 'Bob',
            instrument: 'guitar',
          },
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      setRoom(mockRoom);

      expect(setStore).toHaveBeenCalledWith('workspace', 'room', mockRoom);
    });

    it('should set room with minimal room data', () => {
      const mockRoom: Room = {
        roomId: 'minimal-room',
        name: 'Minimal Room',
        users: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setRoom(mockRoom);

      expect(setStore).toHaveBeenCalledWith('workspace', 'room', mockRoom);
    });

    it('should handle room with single user', () => {
      const mockRoom: Room = {
        roomId: 'solo-room',
        name: 'Solo Practice',
        users: {
          'solo-user': {
            userId: 'solo-user',
            displayName: 'Solo Player',
            instrument: 'piano',
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setRoom(mockRoom);

      expect(setStore).toHaveBeenCalledWith('workspace', 'room', mockRoom);
    });

    it('should handle room with many users', () => {
      const users: Record<string, User> = {};
      for (let i = 1; i <= 10; i++) {
        users[`user-${i}`] = {
          userId: `user-${i}`,
          displayName: `User ${i}`,
          color: '#000000',
          instrument: i % 2 === 0 ? 'piano' : 'guitar',
        };
      }

      const mockRoom: Room = {
        roomId: 'crowded-room',
        name: 'Jam Session',
        users,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setRoom(mockRoom);

      expect(setStore).toHaveBeenCalledWith('workspace', 'room', mockRoom);
    });

    it('should handle room with special characters in name', () => {
      const mockRoom: Room = {
        roomId: 'special-room',
        name: 'Room with 🎵 Émojis & Spëcial Chars!',
        users: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setRoom(mockRoom);

      expect(setStore).toHaveBeenCalledWith('workspace', 'room', mockRoom);
    });

    it('should handle room updates (same room ID, different data)', () => {
      const initialRoom: Room = {
        roomId: 'dynamic-room',
        name: 'Initial Name',
        users: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedRoom: Room = {
        roomId: 'dynamic-room',
        name: 'Updated Name',
        users: {
          'new-user': {
            userId: 'new-user',
            displayName: 'New User',
            instrument: 'drums',
          },
        },
        createdAt: initialRoom.createdAt,
        updatedAt: new Date(),
      };

      setRoom(initialRoom);
      setRoom(updatedRoom);

      expect(setStore).toHaveBeenCalledTimes(2);
      expect(setStore).toHaveBeenNthCalledWith(1, 'workspace', 'room', initialRoom);
      expect(setStore).toHaveBeenNthCalledWith(2, 'workspace', 'room', updatedRoom);
    });

    it('should preserve room object integrity', () => {
      const mockRoom: Room = {
        roomId: 'integrity-test',
        name: 'Test Room',
        users: {
          'user-1': {
            userId: 'user-1',
            displayName: 'Test User',
            instrument: 'piano',
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setRoom(mockRoom);

      const passedRoom = vi.mocked(setStore).mock.calls[0][2];
      expect(passedRoom).toBe(mockRoom); // Should pass the exact same object reference
      expect(passedRoom).toEqual(mockRoom); // Should have the same content
    });
  });

  describe('setUserId', () => {
    it('should set user ID with string value', () => {
      setUserId('user-12345');

      expect(setStore).toHaveBeenCalledWith('workspace', 'userId', 'user-12345');
    });

    it('should set user ID with UUID format', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      setUserId(uuid);

      expect(setStore).toHaveBeenCalledWith('workspace', 'userId', uuid);
    });

    it('should set user ID with session-based format', () => {
      const sessionId = 'session_abc123def456';
      setUserId(sessionId);

      expect(setStore).toHaveBeenCalledWith('workspace', 'userId', sessionId);
    });

    it('should handle empty string user ID', () => {
      setUserId('');

      expect(setStore).toHaveBeenCalledWith('workspace', 'userId', '');
    });

    it('should handle user ID changes', () => {
      setUserId('initial-user');
      setUserId('updated-user');
      setUserId('final-user');

      expect(setStore).toHaveBeenCalledTimes(3);
      expect(setStore).toHaveBeenNthCalledWith(1, 'workspace', 'userId', 'initial-user');
      expect(setStore).toHaveBeenNthCalledWith(2, 'workspace', 'userId', 'updated-user');
      expect(setStore).toHaveBeenNthCalledWith(3, 'workspace', 'userId', 'final-user');
    });

    it('should handle user ID with special characters', () => {
      const specialUserId = 'user@domain.com-123_test';
      setUserId(specialUserId);

      expect(setStore).toHaveBeenCalledWith('workspace', 'userId', specialUserId);
    });

    it('should handle numeric user ID (as string)', () => {
      setUserId('123456789');

      expect(setStore).toHaveBeenCalledWith('workspace', 'userId', '123456789');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete room setup flow', () => {
      // Set user ID first
      setUserId('current-user-123');

      // Then set the room
      const mockRoom: Room = {
        roomId: 'integration-room',
        name: 'Integration Test Room',
        users: {
          'current-user-123': {
            userId: 'current-user-123',
            displayName: 'Current User',
            instrument: 'piano',
          },
          'other-user-456': {
            userId: 'other-user-456',
            displayName: 'Other User',
            instrument: 'guitar',
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setRoom(mockRoom);

      expect(setStore).toHaveBeenCalledTimes(2);
      expect(setStore).toHaveBeenNthCalledWith(1, 'workspace', 'userId', 'current-user-123');
      expect(setStore).toHaveBeenNthCalledWith(2, 'workspace', 'room', mockRoom);
    });

    it('should handle room user changes after initial setup', () => {
      const userId = 'stable-user';
      setUserId(userId);

      // Initial room state
      const initialRoom: Room = {
        roomId: 'evolving-room',
        name: 'Evolving Room',
        users: {
          [userId]: {
            userId,
            displayName: 'Stable User',
            instrument: 'piano',
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setRoom(initialRoom);

      // User joins
      const roomWithNewUser: Room = {
        ...initialRoom,
        users: {
          ...initialRoom.users,
          'new-user': {
            userId: 'new-user',
            displayName: 'New User',
            instrument: 'drums',
          },
        },
        updatedAt: new Date(),
      };

      setRoom(roomWithNewUser);

      // User leaves
      const roomAfterUserLeaves: Room = {
        ...roomWithNewUser,
        users: {
          [userId]: roomWithNewUser.users[userId],
        },
        updatedAt: new Date(),
      };

      setRoom(roomAfterUserLeaves);

      expect(setStore).toHaveBeenCalledTimes(4); // 1 setUserId + 3 setRoom calls
    });

    it('should handle concurrent room and user updates', () => {
      // Simulate rapid updates that might happen during real-time collaboration
      setUserId('rapid-user-1');
      setRoom({
        roomId: 'rapid-room',
        name: 'Rapid Room',
        users: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      setUserId('rapid-user-2');
      setRoom({
        roomId: 'rapid-room-2',
        name: 'Another Rapid Room',
        users: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(setStore).toHaveBeenCalledTimes(4);
    });
  });
});
