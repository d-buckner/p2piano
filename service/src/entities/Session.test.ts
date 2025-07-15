import { vi, describe, it, expect, beforeEach } from 'vitest';
import Database from '../clients/Database';
import RedisClient from '../clients/RedisClient';
import ConfigProvider from '../config/ConfigProvider';
import { SessionNotFoundError } from '../errors';
import SessionProvider from './Session';
import type { Session } from './Session';

// Mock ConfigProvider to test IP validation
vi.mock('../config/ConfigProvider', () => ({
  default: {
    isProduction: vi.fn(),
    getRedisUri: vi.fn(() => 'redis://localhost:6379'),
  },
}));

// Mock RedisClient
vi.mock('../clients/RedisClient', () => ({
  default: {
    hSet: vi.fn(),
    hGet: vi.fn(),
    hGetAll: vi.fn(),
    expire: vi.fn(),
    del: vi.fn(),
  },
}));

describe('SessionProvider', () => {
  let mockRedisClient: any;
  let mockRandomUUID: any;
  let mockConfigProvider: any;

  beforeEach(() => {
    // Get the mocked Redis client
    mockRedisClient = RedisClient as any;
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
      mockRedisClient.hSet.mockResolvedValue('OK');
      mockRedisClient.expire.mockResolvedValue(1);

      const result = await SessionProvider.create(ipAddress, userAgent);

      expect(result).toEqual({
        sessionId,
        createdAt: expect.any(Date),
        lastActivity: expect.any(Date),
        ipAddress,
        userAgent,
      });

      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        `session:${sessionId}`,
        'data',
        expect.stringContaining(sessionId)
      );
      expect(mockRedisClient.expire).toHaveBeenCalledWith(`session:${sessionId}`, 86400);
    });

    it('should create a session without optional metadata', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockRandomUUID.mockReturnValue(sessionId);
      mockRedisClient.hSet.mockResolvedValue('OK');
      mockRedisClient.expire.mockResolvedValue(1);

      const result = await SessionProvider.create();

      expect(result).toEqual({
        sessionId,
        createdAt: expect.any(Date),
        lastActivity: expect.any(Date),
      });

      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        `session:${sessionId}`,
        'data',
        expect.stringContaining(sessionId)
      );
    });

    it('should set createdAt and lastActivity to the same time', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockRandomUUID.mockReturnValue(sessionId);
      mockRedisClient.hSet.mockResolvedValue('OK');
      mockRedisClient.expire.mockResolvedValue(1);

      const result = await SessionProvider.create();
      
      expect(result.createdAt).toEqual(result.lastActivity);
    });

    it('should handle database insertion errors', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockRandomUUID.mockReturnValue(sessionId);
      mockRedisClient.hSet.mockRejectedValue(new Error('Redis error'));

      await expect(SessionProvider.create()).rejects.toThrow('Redis error');
    });
  });

  describe('get', () => {
    it('should retrieve and update session activity', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const requestIp = '192.168.1.1';
      const mockSession = {
        sessionId,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        lastActivity: new Date('2023-01-01T00:00:00Z'),
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
      };

      mockRedisClient.hGet.mockResolvedValue(JSON.stringify(mockSession));
      mockRedisClient.hSet.mockResolvedValue('OK');
      mockRedisClient.expire.mockResolvedValue(1);

      const result = await SessionProvider.get(sessionId, requestIp);

      expect(result.sessionId).toBe(sessionId);
      expect(mockRedisClient.hGet).toHaveBeenCalledWith(`session:${sessionId}`, 'data');
      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        `session:${sessionId}`,
        'data',
        expect.any(String)
      );
    });

    it('should throw SessionNotFoundError when session does not exist', async () => {
      const sessionId = 'non-existent';
      const requestIp = '192.168.1.1';
      
      mockRedisClient.hGet.mockResolvedValue(null);

      await expect(SessionProvider.get(sessionId, requestIp)).rejects.toThrow(SessionNotFoundError);
      
      expect(mockRedisClient.hGet).toHaveBeenCalledWith(`session:${sessionId}`, 'data');
      expect(mockRedisClient.hSet).not.toHaveBeenCalled();
    });

    it('should handle database query errors', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const requestIp = '192.168.1.1';
      
      mockRedisClient.hGet.mockRejectedValue(new Error('Redis error'));

      await expect(SessionProvider.get(sessionId, requestIp)).rejects.toThrow('Redis error');
    });

    it('should handle database update errors after successful find', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const requestIp = '192.168.1.1';
      const mockSession = {
        sessionId,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        lastActivity: new Date('2023-01-01T00:00:00Z'),
      };

      mockRedisClient.hGet.mockResolvedValue(JSON.stringify(mockSession));
      mockRedisClient.hSet.mockRejectedValue(new Error('Update failed'));

      await expect(SessionProvider.get(sessionId, requestIp)).rejects.toThrow('Update failed');
    });
  });

  describe('Session expiration behavior', () => {
    it('should set 24-hour TTL when creating session', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockRandomUUID.mockReturnValue(sessionId);
      mockRedisClient.hSet.mockResolvedValue('OK');
      mockRedisClient.expire.mockResolvedValue(1);

      await SessionProvider.create();

      expect(mockRedisClient.expire).toHaveBeenCalledWith(`session:${sessionId}`, 86400);
    });

    it('should refresh TTL when accessing session', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = {
        sessionId,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        lastActivity: new Date('2023-01-01T00:00:00Z'),
      };

      mockRedisClient.hGet.mockResolvedValue(JSON.stringify(mockSession));
      mockRedisClient.hSet.mockResolvedValue('OK');
      mockRedisClient.expire.mockResolvedValue(1);

      await SessionProvider.get(sessionId, '192.168.1.1');

      expect(mockRedisClient.expire).toHaveBeenCalledWith(`session:${sessionId}`, 86400);
    });

    it('should handle JSON parsing errors gracefully', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockRedisClient.hGet.mockResolvedValue('invalid-json');

      await expect(SessionProvider.get(sessionId, '192.168.1.1')).rejects.toThrow();
    });

    it('should handle empty string session data', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockRedisClient.hGet.mockResolvedValue('');

      await expect(SessionProvider.get(sessionId, '192.168.1.1')).rejects.toThrow(SessionNotFoundError);
    });
  });

  describe('IP address validation', () => {
    const sessionId = '550e8400-e29b-41d4-a716-446655440000';
    const originalIp = '192.168.1.1';
    const differentIp = '192.168.1.2';
    const mockSession = {
      sessionId,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      lastActivity: new Date('2023-01-01T00:00:00Z'),
      ipAddress: originalIp,
    };

    it('should allow IP mismatch in non-production mode', async () => {
      mockConfigProvider.isProduction.mockReturnValue(false);
      mockRedisClient.hGet.mockResolvedValue(JSON.stringify(mockSession));
      mockRedisClient.hSet.mockResolvedValue('OK');
      mockRedisClient.expire.mockResolvedValue(1);

      const result = await SessionProvider.get(sessionId, differentIp);

      expect(result.sessionId).toBe(sessionId);
      expect(mockRedisClient.hSet).toHaveBeenCalled();
    });

    it('should allow IP mismatch even in production mode (validation disabled)', async () => {
      mockConfigProvider.isProduction.mockReturnValue(true);
      mockRedisClient.hGet.mockResolvedValue(JSON.stringify(mockSession));
      mockRedisClient.hSet.mockResolvedValue('OK');
      mockRedisClient.expire.mockResolvedValue(1);

      const result = await SessionProvider.get(sessionId, differentIp);
      
      expect(result.sessionId).toBe(sessionId);
      expect(result.ipAddress).toBe(differentIp); // IP should be updated
      expect(mockRedisClient.hGet).toHaveBeenCalledWith(`session:${sessionId}`, 'data');
      expect(mockRedisClient.hSet).toHaveBeenCalled();
    });

    it('should allow matching IP addresses in production', async () => {
      mockConfigProvider.isProduction.mockReturnValue(true);
      mockRedisClient.hGet.mockResolvedValue(JSON.stringify(mockSession));
      mockRedisClient.hSet.mockResolvedValue('OK');
      mockRedisClient.expire.mockResolvedValue(1);

      const result = await SessionProvider.get(sessionId, originalIp);

      expect(result.sessionId).toBe(sessionId);
      expect(mockRedisClient.hSet).toHaveBeenCalled();
    });

    it('should allow access when session has no stored IP address', async () => {
      mockConfigProvider.isProduction.mockReturnValue(true);
      const sessionWithoutIp = {
        sessionId,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        lastActivity: new Date('2023-01-01T00:00:00Z'),
      };
      
      mockRedisClient.hGet.mockResolvedValue(JSON.stringify(sessionWithoutIp));
      mockRedisClient.hSet.mockResolvedValue('OK');
      mockRedisClient.expire.mockResolvedValue(1);

      const result = await SessionProvider.get(sessionId, differentIp);

      expect(result.sessionId).toBe(sessionId);
      expect(mockRedisClient.hSet).toHaveBeenCalled();
    });
  });
});
