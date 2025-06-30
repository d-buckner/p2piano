import SessionProvider, { Session } from './Session';
import Database from '../clients/Database';
import { SessionNotFoundError } from '../errors';

// Mock Database
jest.mock('../clients/Database', () => ({
  default: {
    collection: jest.fn(),
  },
}));

// Mock crypto.randomUUID instead of uuid package
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn().mockReturnValue('550e8400-e29b-41d4-a716-446655440000'),
  },
});

describe('SessionProvider', () => {
  let mockCollection: any;
  let mockRandomUUID: jest.Mock;

  beforeEach(() => {
    mockCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      createIndex: jest.fn(),
    };

    (Database.collection as jest.Mock).mockReturnValue(mockCollection);
    mockRandomUUID = global.crypto.randomUUID as jest.Mock;
    
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a session with all metadata', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0 (Test Browser)';
      
      mockRandomUUID.mockReturnValue(sessionId);
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'some-id' });

      const result = await SessionProvider.create(ipAddress, userAgent);

      expect(result).toEqual({
        sessionId,
        createdAt: expect.any(Date),
        lastActivity: expect.any(Date),
        ipAddress,
        userAgent,
      });

      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        sessionId,
        createdAt: expect.any(Date),
        lastActivity: expect.any(Date),
        ipAddress,
        userAgent,
      });
    });

    it('should create a session without optional metadata', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockRandomUUID.mockReturnValue(sessionId);
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'some-id' });

      const result = await SessionProvider.create();

      expect(result).toEqual({
        sessionId,
        createdAt: expect.any(Date),
        lastActivity: expect.any(Date),
        ipAddress: undefined,
        userAgent: undefined,
      });

      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        sessionId,
        createdAt: expect.any(Date),
        lastActivity: expect.any(Date),
        ipAddress: undefined,
        userAgent: undefined,
      });
    });

    it('should set createdAt and lastActivity to the same time', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockRandomUUID.mockReturnValue(sessionId);
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'some-id' });

      const result = await SessionProvider.create();

      expect(result.createdAt).toEqual(result.lastActivity);
    });

    it('should handle database insertion errors', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockRandomUUID.mockReturnValue(sessionId);
      mockCollection.insertOne.mockRejectedValue(new Error('Database error'));

      await expect(SessionProvider.create()).rejects.toThrow('Database error');
    });
  });

  describe('get', () => {
    it('should retrieve and update session activity', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession: Session = {
        sessionId,
        createdAt: new Date('2023-01-01'),
        lastActivity: new Date('2023-01-01'),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      mockCollection.findOne.mockResolvedValue(mockSession);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await SessionProvider.get(sessionId);

      expect(result).toBe(mockSession);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ sessionId });
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { sessionId },
        { $set: { lastActivity: expect.any(Date) } }
      );
    });

    it('should throw SessionNotFoundError when session does not exist', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';

      mockCollection.findOne.mockResolvedValue(null);

      await expect(SessionProvider.get(sessionId))
        .rejects.toThrow(new SessionNotFoundError(`Session ${sessionId} does not exist`));

      expect(mockCollection.findOne).toHaveBeenCalledWith({ sessionId });
      expect(mockCollection.updateOne).not.toHaveBeenCalled();
    });

    it('should handle database query errors', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';

      mockCollection.findOne.mockRejectedValue(new Error('Database error'));

      await expect(SessionProvider.get(sessionId)).rejects.toThrow('Database error');
    });

    it('should handle database update errors after successful find', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession: Session = {
        sessionId,
        createdAt: new Date('2023-01-01'),
        lastActivity: new Date('2023-01-01'),
      };

      mockCollection.findOne.mockResolvedValue(mockSession);
      mockCollection.updateOne.mockRejectedValue(new Error('Update failed'));

      // Should still return the session even if update fails
      await expect(SessionProvider.get(sessionId)).rejects.toThrow('Update failed');
    });
  });

  describe('database indexes', () => {
    it('should create proper indexes on initialization', () => {
      // The indexes are created when the module is loaded
      expect(mockCollection.createIndex).toHaveBeenCalledWith({ sessionId: 1 });
      expect(mockCollection.createIndex).toHaveBeenCalledWith(
        { lastActivity: 1 }, 
        { expireAfterSeconds: 86400 }
      );
    });
  });

  describe('session expiration', () => {
    it('should set TTL to 24 hours (86400 seconds)', () => {
      // Verify the TTL index is set correctly
      expect(mockCollection.createIndex).toHaveBeenCalledWith(
        { lastActivity: 1 }, 
        { expireAfterSeconds: 86400 }
      );
    });
  });

  describe('edge cases', () => {
    it('should handle undefined sessionId in get', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      await expect(SessionProvider.get(undefined as any))
        .rejects.toThrow(SessionNotFoundError);
    });

    it('should handle null sessionId in get', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      await expect(SessionProvider.get(null as any))
        .rejects.toThrow(SessionNotFoundError);
    });

    it('should handle empty string sessionId in get', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      await expect(SessionProvider.get(''))
        .rejects.toThrow(SessionNotFoundError);
    });

    it('should handle very long IP addresses', async () => {
      const longIp = 'a'.repeat(1000);
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockRandomUUID.mockReturnValue(sessionId);
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'some-id' });

      const result = await SessionProvider.create(longIp);

      expect(result.ipAddress).toBe(longIp);
    });

    it('should handle very long user agents', async () => {
      const longUserAgent = 'Mozilla/5.0 ' + 'a'.repeat(1000);
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockRandomUUID.mockReturnValue(sessionId);
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'some-id' });

      const result = await SessionProvider.create(undefined, longUserAgent);

      expect(result.userAgent).toBe(longUserAgent);
    });
  });
});