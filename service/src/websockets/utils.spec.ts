import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConfigProvider from '../config/ConfigProvider';
import SessionRegistry from './SessionRegistry';
import { getWebSocketGatewayOptions, getSocketSessionId, getSocketRoomId, getSocketDisplayName, getSocketMetadata, broadcast, broadcastToSubset } from './utils';
import type { AuthenticatedSocket } from '../types/socket';

// Mock ConfigProvider
vi.mock('../config/ConfigProvider', () => ({
  default: {
    isProduction: vi.fn(),
  },
}));

// Mock SessionRegistry
vi.mock('./SessionRegistry', () => ({
  default: {
    getSocketMetadata: vi.fn(),
    getServerId: vi.fn(),
  },
}));

describe('websockets/utils', () => {
  const mockSocket = {
    id: 'socket-1',
    session: { sessionId: 'session-1' },
    handshake: {
      query: {
        roomId: 'room-1',
        displayName: 'Test User',
      },
    },
    to: vi.fn(() => ({ emit: vi.fn() })),
    emit: vi.fn(),
  } as unknown as AuthenticatedSocket;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getWebSocketGatewayOptions', () => {
    it('should return cors false when in production', () => {
      vi.mocked(ConfigProvider.isProduction).mockReturnValue(true);
      
      const options = getWebSocketGatewayOptions();
      expect(options.cors).toBe(false);
    });

    it('should return cors config when not in production', () => {
      vi.mocked(ConfigProvider.isProduction).mockReturnValue(false);
      
      const options = getWebSocketGatewayOptions();
      expect(options.cors).toEqual({
        credentials: true,
        origin: 'http://localhost:5173',
      });
    });
  });

  describe('getSocketSessionId', () => {
    it('should return session id when session exists', () => {
      const result = getSocketSessionId(mockSocket);
      expect(result).toBe('session-1');
    });

    it('should return null when session does not exist', () => {
      const socketWithoutSession = { ...mockSocket, session: null } as unknown as AuthenticatedSocket;
      const result = getSocketSessionId(socketWithoutSession);
      expect(result).toBe(null);
    });
  });

  describe('getSocketRoomId', () => {
    it('should return room id from handshake query', () => {
      const result = getSocketRoomId(mockSocket);
      expect(result).toBe('room-1');
    });
  });

  describe('getSocketDisplayName', () => {
    it('should return display name from handshake query', () => {
      const result = getSocketDisplayName(mockSocket);
      expect(result).toBe('Test User');
    });
  });

  describe('getSocketMetadata', () => {
    it('should return combined metadata', () => {
      const result = getSocketMetadata(mockSocket);
      expect(result).toEqual({
        displayName: 'Test User',
        sessionId: 'session-1',
        roomId: 'room-1',
      });
    });
  });

  describe('broadcast', () => {
    it('should broadcast to room with decorated payload', () => {
      const mockEmit = vi.fn();
      const mockTo = vi.fn(() => ({ emit: mockEmit }));
      const mockSocketForBroadcast = {
        ...mockSocket,
        to: mockTo,
      } as unknown as AuthenticatedSocket;

      broadcast(mockSocketForBroadcast, 'test-event', { data: 'test' });

      expect(mockTo).toHaveBeenCalledWith('room-1');
      expect(mockEmit).toHaveBeenCalledWith('test-event', {
        data: 'test',
        userId: 'session-1',
      });
    });
  });

  describe('broadcastToSubset', () => {
    it('should broadcast to local user sockets', async () => {
      const mockTargetSocketInfo = { 
        serverId: 'current-server',
        socketId: 'target-socket-1' 
      };
      
      vi.mocked(SessionRegistry.getSocketMetadata).mockResolvedValue(mockTargetSocketInfo);
      vi.mocked(SessionRegistry.getServerId).mockReturnValue('current-server');

      const mockEmit = vi.fn();
      const mockTo = vi.fn(() => ({ emit: mockEmit }));
      const mockSocketForBroadcast = {
        ...mockSocket,
        to: mockTo,
      } as unknown as AuthenticatedSocket;

      broadcastToSubset(mockSocketForBroadcast, ['user-1'], 'test-event', { data: 'test' });

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(SessionRegistry.getSocketMetadata).toHaveBeenCalledWith('user-1');
      expect(mockTo).toHaveBeenCalledWith('target-socket-1');
      expect(mockEmit).toHaveBeenCalledWith('test-event', {
        data: 'test',
        userId: 'session-1',
      });
    });

    it('should broadcast to remote user sockets', async () => {
      const mockTargetSocketInfo = { 
        serverId: 'different-server',
        socketId: 'target-socket-1' 
      };
      
      vi.mocked(SessionRegistry.getSocketMetadata).mockResolvedValue(mockTargetSocketInfo);
      vi.mocked(SessionRegistry.getServerId).mockReturnValue('current-server');

      const mockEmit = vi.fn();
      const mockTo = vi.fn(() => ({ emit: mockEmit }));
      const mockSocketForBroadcast = {
        ...mockSocket,
        to: mockTo,
      } as unknown as AuthenticatedSocket;

      broadcastToSubset(mockSocketForBroadcast, ['user-1'], 'test-event', { data: 'test' });

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(SessionRegistry.getSocketMetadata).toHaveBeenCalledWith('user-1');
      expect(mockTo).toHaveBeenCalledWith('user-1'); // Cross-server uses userId
      expect(mockEmit).toHaveBeenCalledWith('test-event', {
        data: 'test',
        userId: 'session-1',
      });
    });

    it('should handle missing target sockets gracefully', async () => {
      vi.mocked(SessionRegistry.getSocketMetadata).mockResolvedValue(null);

      const mockEmit = vi.fn();
      const mockTo = vi.fn(() => ({ emit: mockEmit }));
      const mockSocketForBroadcast = {
        ...mockSocket,
        to: mockTo,
      } as unknown as AuthenticatedSocket;

      // Should not throw
      expect(() => {
        broadcastToSubset(mockSocketForBroadcast, ['non-existent-user'], 'test-event', { data: 'test' });
      }).not.toThrow();

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 0));

      // Should not emit anything
      expect(mockEmit).not.toHaveBeenCalled();
    });
  });
});
