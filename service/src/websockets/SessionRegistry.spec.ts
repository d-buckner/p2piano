import { describe, it, expect, vi, beforeEach } from 'vitest';
import RedisClient from '../clients/RedisClient';
import SessionRegistry from './SessionRegistry';
import type { Socket } from 'socket.io';

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-server-id'),
}));

// Mock Redis client
vi.mock('../clients/RedisClient', () => ({
  default: {
    hSet: vi.fn(),
    hGetAll: vi.fn(),
    expire: vi.fn(),
    del: vi.fn(),
  }
}));

describe('SessionRegistry', () => {
  const mockSocket = {
    id: 'socket-id',
    emit: vi.fn(),
  } as unknown as Socket;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerSession', () => {
    it('should register a session with socket in Redis', async () => {
      await SessionRegistry.registerSession('session-1', mockSocket);
      
      expect(RedisClient.hSet).toHaveBeenCalledWith(
        'session:session-1',
        expect.objectContaining({
          socketId: 'socket-id',
          serverId: expect.any(String),
          registeredAt: expect.any(String)
        })
      );
      expect(RedisClient.expire).toHaveBeenCalledWith('session:session-1', 86400);
    });
  });

  describe('getSocketMetadata', () => {
    it('should return socket info for existing session', async () => {
      vi.mocked(RedisClient.hGetAll).mockResolvedValue({
        serverId: 'server-1',
        socketId: 'socket-id',
        registeredAt: '1234567890'
      });
      
      const result = await SessionRegistry.getSocketMetadata('session-1');
      
      expect(result).toEqual({
        serverId: 'server-1',
        socketId: 'socket-id'
      });
      expect(RedisClient.hGetAll).toHaveBeenCalledWith('session:session-1');
    });

    it('should return null for non-existent session', async () => {
      vi.mocked(RedisClient.hGetAll).mockResolvedValue({});
      
      const result = await SessionRegistry.getSocketMetadata('non-existent');
      
      expect(result).toBeNull();
    });
  });

  describe('destroySession', () => {
    it('should remove session from Redis', async () => {
      await SessionRegistry.destroySession('session-1');
      
      expect(RedisClient.del).toHaveBeenCalledWith('session:session-1');
    });
  });

  describe('isLocalSession', () => {
    it('should return true for sessions on current server', async () => {
      vi.mocked(RedisClient.hGetAll).mockResolvedValue({
        serverId: SessionRegistry.getServerId(),
        socketId: 'socket-id',
        registeredAt: '1234567890'
      });
      
      const result = await SessionRegistry.isLocalSession('session-1');
      
      expect(result).toBe(true);
    });

    it('should return false for sessions on different server', async () => {
      vi.mocked(RedisClient.hGetAll).mockResolvedValue({
        serverId: 'different-server',
        socketId: 'socket-id',
        registeredAt: '1234567890'
      });
      
      const result = await SessionRegistry.isLocalSession('session-1');
      
      expect(result).toBe(false);
    });

    it('should return false for non-existent session', async () => {
      vi.mocked(RedisClient.hGetAll).mockResolvedValue({});
      
      const result = await SessionRegistry.isLocalSession('non-existent');
      
      expect(result).toBe(false);
    });

    it('should return false for session with missing serverId', async () => {
      vi.mocked(RedisClient.hGetAll).mockResolvedValue({
        socketId: 'socket-id',
        registeredAt: '1234567890'
      });
      
      const result = await SessionRegistry.isLocalSession('session-1');
      
      expect(result).toBe(false);
    });
  });

  describe('getServerId', () => {
    it('should return consistent server ID', () => {
      const serverId1 = SessionRegistry.getServerId();
      const serverId2 = SessionRegistry.getServerId();
      
      expect(serverId1).toBe(serverId2);
      expect(typeof serverId1).toBe('string');
      expect(serverId1.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis errors in registerSession', async () => {
      vi.mocked(RedisClient.hSet).mockRejectedValueOnce(new Error('Redis error'));
      
      await expect(SessionRegistry.registerSession('session-1', mockSocket)).rejects.toThrow('Redis error');
    });

    it('should handle Redis errors in getSocketMetadata', async () => {
      vi.mocked(RedisClient.hGetAll).mockRejectedValueOnce(new Error('Redis error'));
      
      await expect(SessionRegistry.getSocketMetadata('session-1')).rejects.toThrow('Redis error');
    });

    it('should handle Redis errors in destroySession', async () => {
      vi.mocked(RedisClient.del).mockRejectedValueOnce(new Error('Redis error'));
      
      await expect(SessionRegistry.destroySession('session-1')).rejects.toThrow('Redis error');
    });

    it('should handle Redis errors in isLocalSession', async () => {
      vi.mocked(RedisClient.hGetAll).mockRejectedValueOnce(new Error('Redis error'));
      
      await expect(SessionRegistry.isLocalSession('session-1')).rejects.toThrow('Redis error');
    });
  });

  describe('Data Persistence', () => {
    it('should set proper TTL for session data', async () => {
      vi.mocked(RedisClient.hSet).mockResolvedValue(1);
      vi.mocked(RedisClient.expire).mockResolvedValue(1);
      
      await SessionRegistry.registerSession('session-1', mockSocket);
      
      expect(RedisClient.expire).toHaveBeenCalledWith('session:session-1', 86400);
    });

    it('should include timestamp in session registration', async () => {
      vi.mocked(RedisClient.hSet).mockResolvedValue(1);
      vi.mocked(RedisClient.expire).mockResolvedValue(1);
      
      const beforeTime = Date.now();
      
      await SessionRegistry.registerSession('session-1', mockSocket);
      
      const afterTime = Date.now();
      const registrationCall = vi.mocked(RedisClient.hSet).mock.calls[0];
      const sessionData = registrationCall[1] as Record<string, string>;
      const registeredAt = parseInt(sessionData.registeredAt, 10);
      
      expect(registeredAt).toBeGreaterThanOrEqual(beforeTime);
      expect(registeredAt).toBeLessThanOrEqual(afterTime);
    });

    it('should handle partial session data in getSocketMetadata', async () => {
      vi.mocked(RedisClient.hGetAll).mockResolvedValue({
        serverId: 'server-1',
        // missing socketId
        registeredAt: '1234567890'
      });
      
      const result = await SessionRegistry.getSocketMetadata('session-1');
      
      expect(result).toBeNull();
    });

    it('should handle session data with missing socketId', async () => {
      vi.mocked(RedisClient.hGetAll).mockResolvedValue({
        serverId: 'server-1',
        registeredAt: '1234567890'
        // missing socketId
      });
      
      const result = await SessionRegistry.getSocketMetadata('session-1');
      
      expect(result).toBeNull();
    });
  });
});
