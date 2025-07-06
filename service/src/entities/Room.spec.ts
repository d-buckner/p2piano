import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Import after mocks are set up
import { RoomNotFoundError } from '../errors';
import { createUUID } from '../test-utils/validation.helpers';
import { getNextColor } from '../utils/ColorUtils';
import Room from './Room';

// Mock Database with hoisted function to ensure it's available before module imports
const mockCollection = vi.hoisted(() => ({
  insertOne: vi.fn(),
  findOne: vi.fn(),
  updateOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
  createIndex: vi.fn(),
}));

vi.mock('../clients/Database', () => ({
  default: {
    collection: vi.fn(() => mockCollection),
  },
}));

vi.mock('../utils/ColorUtils', () => ({
  getNextColor: vi.fn(),
}));

// Mock nanoid to return predictable room IDs
const mockNanoidGenerator = vi.hoisted(() => vi.fn());
const mockCustomAlphabet = vi.hoisted(() => vi.fn(() => mockNanoidGenerator));

vi.mock('nanoid', () => ({
  customAlphabet: mockCustomAlphabet,
}));

describe('Room Entity', () => {
  let mockGetNextColor: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup color utility mock
    mockGetNextColor = getNextColor as any;
    mockGetNextColor.mockReturnValue('#FF0000');

    // Reset and setup nanoid mock to return predictable IDs for each test
    mockNanoidGenerator.mockReset();
    mockNanoidGenerator.mockReturnValue('abc12');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Room creation', () => {
    it('should create a new room with generated ID', async () => {
      const mockInsertResult = { insertedId: 'mock-object-id' };
      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      const room = await Room.create();

      expect(room).toBeInstanceOf(Room);
      expect(room.roomId).toBe('abc12');
      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        roomId: 'abc12',
        users: {},
        createdAt: expect.any(Date),
      });
    });

    it('should generate unique room IDs on multiple calls', async () => {
      // Setup mock for multiple sequential calls
      mockNanoidGenerator.mockReset();
      mockNanoidGenerator
        .mockReturnValueOnce('abc12')
        .mockReturnValueOnce('def34')
        .mockReturnValueOnce('ghi56');
      
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'mock-id' });

      const room1 = await Room.create();
      const room2 = await Room.create();
      const room3 = await Room.create();

      expect(room1.roomId).toBe('abc12');
      expect(room2.roomId).toBe('def34');
      expect(room3.roomId).toBe('ghi56');
    });

    it('should handle database insertion errors', async () => {
      const dbError = new Error('Database insertion failed');
      mockCollection.insertOne.mockRejectedValue(dbError);

      await expect(Room.create()).rejects.toThrow('Database insertion failed');
    });

    it('should create room with empty users object', async () => {
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'mock-id' });

      await Room.create();

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          users: {},
        })
      );
    });

    it('should set creation timestamp', async () => {
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'mock-id' });

      const beforeTime = Date.now();
      await Room.create();
      const afterTime = Date.now();

      const insertCall = mockCollection.insertOne.mock.calls[0];
      const createdAt = insertCall[0].createdAt.getTime();
      
      expect(createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(createdAt).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Room retrieval', () => {
    const roomId = 'test123';
    const mockRoomData = {
      roomId,
      users: {
        'user1': { userId: 'user1', displayName: 'Test User', color: '#FF0000', instrument: 'PIANO' },
      },
      createdAt: new Date('2023-01-01T00:00:00Z'),
    };

    it('should retrieve existing room data', async () => {
      mockCollection.findOne.mockResolvedValue(mockRoomData);

      const room = new Room(roomId);
      const result = await room.get();

      expect(result).toBe(mockRoomData);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ roomId });
    });

    it('should throw RoomNotFoundError when room does not exist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const room = new Room('nonexistent');
      
      await expect(room.get()).rejects.toThrow(
        new RoomNotFoundError('Room nonexistent does not exist')
      );
    });

    it('should handle database query errors', async () => {
      const dbError = new Error('Database query failed');
      mockCollection.findOne.mockRejectedValue(dbError);

      const room = new Room(roomId);
      
      await expect(room.get()).rejects.toThrow('Database query failed');
    });
  });

  describe('User joining', () => {
    const roomId = 'test123';
    const userId = createUUID();
    const displayName = 'Test User';

    it('should add new user to empty room', async () => {
      const emptyRoom = {
        roomId,
        users: {},
        createdAt: new Date(),
      };

      mockCollection.findOne.mockResolvedValue(emptyRoom);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockGetNextColor.mockReturnValue('#FF0000');

      const room = new Room(roomId);
      const result = await room.join(userId, displayName);

      expect(result).toBe(emptyRoom);
      expect(mockGetNextColor).toHaveBeenCalledWith([]);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { roomId },
        {
          $set: {
            users: {
              [userId]: {
                userId,
                displayName,
                color: '#FF0000',
                instrument: 'PIANO',
              },
            },
          },
        }
      );
    });

    it('should add new user to room with existing users', async () => {
      const existingUser = { userId: 'existing', displayName: 'Existing', color: '#00FF00', instrument: 'PIANO' };
      const roomWithUsers = {
        roomId,
        users: { existing: existingUser },
        createdAt: new Date(),
      };

      mockCollection.findOne.mockResolvedValue(roomWithUsers);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockGetNextColor.mockReturnValue('#FF0000');

      const room = new Room(roomId);
      const result = await room.join(userId, displayName);

      expect(result).toBe(roomWithUsers);
      expect(mockGetNextColor).toHaveBeenCalledWith(['#00FF00']);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { roomId },
        {
          $set: {
            users: {
              existing: existingUser,
              [userId]: {
                userId,
                displayName,
                color: '#FF0000',
                instrument: 'PIANO',
              },
            },
          },
        }
      );
    });

    it('should return existing room data when user already joined', async () => {
      const existingUser = { userId, displayName: 'Old Name', color: '#00FF00', instrument: 'PIANO' };
      const roomWithUser = {
        roomId,
        users: { [userId]: existingUser },
        createdAt: new Date(),
      };

      mockCollection.findOne.mockResolvedValue(roomWithUser);

      const room = new Room(roomId);
      const result = await room.join(userId, displayName);

      expect(result).toBe(roomWithUser);
      expect(mockCollection.updateOne).not.toHaveBeenCalled();
      expect(mockGetNextColor).not.toHaveBeenCalled();
    });

    it('should handle room not found during join', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const room = new Room('nonexistent');
      
      await expect(room.join(userId, displayName)).rejects.toThrow(RoomNotFoundError);
    });

    it('should handle database update errors during join', async () => {
      const emptyRoom = { roomId, users: {}, createdAt: new Date() };
      mockCollection.findOne.mockResolvedValue(emptyRoom);
      mockCollection.updateOne.mockRejectedValue(new Error('Update failed'));

      const room = new Room(roomId);
      
      await expect(room.join(userId, displayName)).rejects.toThrow('Update failed');
    });

    it('should handle undefined users field gracefully', async () => {
      const roomWithoutUsers = { roomId, createdAt: new Date() }; // No users field
      mockCollection.findOne.mockResolvedValue(roomWithoutUsers);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockGetNextColor.mockReturnValue('#FF0000');

      const room = new Room(roomId);
      await room.join(userId, displayName);

      expect(mockGetNextColor).toHaveBeenCalledWith([]);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { roomId },
        {
          $set: {
            users: {
              [userId]: {
                userId,
                displayName,
                color: '#FF0000',
                instrument: 'PIANO',
              },
            },
          },
        }
      );
    });
  });

  describe('User updating', () => {
    const roomId = 'test123';
    const userId = createUUID();
    const updatedUser = {
      userId,
      displayName: 'Updated Name',
      color: '#00FF00',
      instrument: 'GUITAR' as const,
    };

    it('should update user and return updated room', async () => {
      const updatedRoom = {
        roomId,
        users: { [userId]: updatedUser },
        createdAt: new Date(),
      };

      mockCollection.findOneAndUpdate.mockResolvedValue(updatedRoom);

      const room = new Room(roomId);
      const result = await room.updateUser(updatedUser);

      expect(result).toBe(updatedRoom);
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { roomId },
        {
          $set: {
            [`users.${userId}`]: updatedUser,
          },
        },
        { returnDocument: 'after' }
      );
    });

    it('should throw RoomNotFoundError when room does not exist during update', async () => {
      mockCollection.findOneAndUpdate.mockResolvedValue(null);

      const room = new Room('nonexistent');
      
      await expect(room.updateUser(updatedUser)).rejects.toThrow(
        new RoomNotFoundError('Room nonexistent does not exist')
      );
    });

    it('should handle database update errors', async () => {
      const dbError = new Error('Update operation failed');
      mockCollection.findOneAndUpdate.mockRejectedValue(dbError);

      const room = new Room(roomId);
      
      await expect(room.updateUser(updatedUser)).rejects.toThrow('Update operation failed');
    });

    it('should update user with different instruments', async () => {
      const guitars = [
        { ...updatedUser, instrument: 'GUITAR' as const },
        { ...updatedUser, instrument: 'BASS' as const },
        { ...updatedUser, instrument: 'DRUMS' as const },
        { ...updatedUser, instrument: 'PIANO' as const },
      ];

      mockCollection.findOneAndUpdate.mockResolvedValue({ roomId, users: {}, createdAt: new Date() });

      const room = new Room(roomId);

      for (const user of guitars) {
        await room.updateUser(user);
        expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
          { roomId },
          {
            $set: {
              [`users.${userId}`]: user,
            },
          },
          { returnDocument: 'after' }
        );
      }
    });
  });

  describe('User leaving', () => {
    const roomId = 'test123';
    const userId = createUUID();

    it('should remove user and return updated room', async () => {
      const updatedRoom = {
        roomId,
        users: {},
        createdAt: new Date(),
      };

      mockCollection.findOneAndUpdate.mockResolvedValue(updatedRoom);

      const room = new Room(roomId);
      const result = await room.leave(userId);

      expect(result).toBe(updatedRoom);
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { roomId },
        {
          $unset: {
            [`users.${userId}`]: '',
          },
        },
        { returnDocument: 'after' }
      );
    });

    it('should throw RoomNotFoundError when room does not exist during leave', async () => {
      mockCollection.findOneAndUpdate.mockResolvedValue(null);

      const room = new Room('nonexistent');
      
      await expect(room.leave(userId)).rejects.toThrow(
        new RoomNotFoundError('Room nonexistent does not exist')
      );
    });

    it('should handle database update errors during leave', async () => {
      const dbError = new Error('Leave operation failed');
      mockCollection.findOneAndUpdate.mockRejectedValue(dbError);

      const room = new Room(roomId);
      
      await expect(room.leave(userId)).rejects.toThrow('Leave operation failed');
    });

    it('should handle leaving when user was not in room', async () => {
      const updatedRoom = {
        roomId,
        users: { 'other-user': { userId: 'other-user', displayName: 'Other', color: '#FF0000', instrument: 'PIANO' } },
        createdAt: new Date(),
      };

      mockCollection.findOneAndUpdate.mockResolvedValue(updatedRoom);

      const room = new Room(roomId);
      const result = await room.leave('non-member');

      expect(result).toBe(updatedRoom);
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { roomId },
        {
          $unset: {
            ['users.non-member']: '',
          },
        },
        { returnDocument: 'after' }
      );
    });
  });

  describe('Room ID generation', () => {

    it('should generate 5-character room IDs', async () => {
      mockNanoidGenerator.mockReturnValue('abc12');
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'mock-id' });

      const room = await Room.create();

      expect(room.roomId).toBe('abc12');
      expect(room.roomId).toHaveLength(5);
    });
  });

  describe('Constructor', () => {
    it('should create room instance with provided ID', () => {
      const roomId = 'test123';
      const room = new Room(roomId);

      expect(room.roomId).toBe(roomId);
    });

    it('should handle various room ID formats', () => {
      const testIds = ['abc12', 'xyz99', '12345', 'abcde'];
      
      testIds.forEach(id => {
        const room = new Room(id);
        expect(room.roomId).toBe(id);
      });
    });
  });
});
