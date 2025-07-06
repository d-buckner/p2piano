import { vi, describe, it, expect, beforeEach } from 'vitest';
import Database from '../clients/Database';
import ConfigProvider from '../config/ConfigProvider';
import { SessionNotFoundError } from '../errors';
import SessionProvider from './Session';
import type { Session } from './Session';

// Mock ConfigProvider to test IP validation
vi.mock('../config/ConfigProvider', () => ({
  default: {
    isProduction: vi.fn(),
  },
}));

describe('SessionProvider', () => {
  let mockCollection: any;
  let mockRandomUUID: any;
  let mockConfigProvider: any;

  beforeEach(() => {
    // Get the mocked collection from the global Database mock
    mockCollection = (Database.collection as any)();
    mockRandomUUID = global.crypto.randomUUID as any;
    mockConfigProvider = ConfigProvider as any;
    mockConfigProvider.isProduction.mockReturnValue(false);
    
    vi.clearAllMocks();
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

  describe('IP address validation', () => {
    const sessionId = '550e8400-e29b-41d4-a716-446655440000';
    const mockSession: Session = {
      sessionId,
      createdAt: new Date('2023-01-01'),
      lastActivity: new Date('2023-01-01'),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    };

    it('should allow IP mismatch in non-production mode', async () => {
      mockConfigProvider.isProduction.mockReturnValue(false);
      mockCollection.findOne.mockResolvedValue(mockSession);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await SessionProvider.get(sessionId, '10.0.0.1');

      expect(result).toBe(mockSession);
      expect(mockCollection.updateOne).toHaveBeenCalled();
    });

    it('should reject IP mismatch in production mode', async () => {
      mockConfigProvider.isProduction.mockReturnValue(true);
      mockCollection.findOne.mockResolvedValue(mockSession);

      await expect(SessionProvider.get(sessionId, '10.0.0.1'))
        .rejects.toThrow(new SessionNotFoundError(`Session ${sessionId} IP mismatch`));

      expect(mockCollection.findOne).toHaveBeenCalledWith({ sessionId });
      expect(mockCollection.updateOne).not.toHaveBeenCalled();
    });

    it('should allow matching IP addresses in production', async () => {
      mockConfigProvider.isProduction.mockReturnValue(true);
      mockCollection.findOne.mockResolvedValue(mockSession);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await SessionProvider.get(sessionId, '192.168.1.1');

      expect(result).toBe(mockSession);
      expect(mockCollection.updateOne).toHaveBeenCalled();
    });

    it('should allow access when session has no stored IP address', async () => {
      const sessionWithoutIP = { ...mockSession, ipAddress: undefined };
      mockConfigProvider.isProduction.mockReturnValue(true);
      mockCollection.findOne.mockResolvedValue(sessionWithoutIP);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await SessionProvider.get(sessionId, '192.168.1.100');

      expect(result).toBe(sessionWithoutIP);
      expect(mockCollection.updateOne).toHaveBeenCalled();
    });

    it('should allow access when no IP address is provided', async () => {
      mockConfigProvider.isProduction.mockReturnValue(true);
      mockCollection.findOne.mockResolvedValue(mockSession);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await SessionProvider.get(sessionId);

      expect(result).toBe(mockSession);
      expect(mockCollection.updateOne).toHaveBeenCalled();
    });

    it('should handle edge case with empty string IP addresses', async () => {
      const sessionWithEmptyIP = { ...mockSession, ipAddress: '' };
      mockConfigProvider.isProduction.mockReturnValue(true);
      mockCollection.findOne.mockResolvedValue(sessionWithEmptyIP);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await SessionProvider.get(sessionId, '192.168.1.1');

      expect(result).toBe(sessionWithEmptyIP);
      expect(mockCollection.updateOne).toHaveBeenCalled();
    });

    it('should validate IPv6 addresses in production', async () => {
      const ipv6Session = { ...mockSession, ipAddress: '2001:db8::1' };
      mockConfigProvider.isProduction.mockReturnValue(true);
      mockCollection.findOne.mockResolvedValue(ipv6Session);

      await expect(SessionProvider.get(sessionId, '2001:db8::2'))
        .rejects.toThrow(SessionNotFoundError);

      expect(mockCollection.updateOne).not.toHaveBeenCalled();
    });

    it('should allow matching IPv6 addresses in production', async () => {
      const ipv6Session = { ...mockSession, ipAddress: '2001:db8::1' };
      mockConfigProvider.isProduction.mockReturnValue(true);
      mockCollection.findOne.mockResolvedValue(ipv6Session);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await SessionProvider.get(sessionId, '2001:db8::1');

      expect(result).toBe(ipv6Session);
      expect(mockCollection.updateOne).toHaveBeenCalled();
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
