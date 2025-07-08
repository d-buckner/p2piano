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
  });
});
