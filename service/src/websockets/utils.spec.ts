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
    getSocket: vi.fn(),
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
    it('should broadcast to specific user sockets', () => {
      const mockTargetSocket = { id: 'target-socket-1' };
      vi.mocked(SessionRegistry.getSocket).mockReturnValue(mockTargetSocket as any);

      const mockEmit = vi.fn();
      const mockTo = vi.fn(() => ({ emit: mockEmit }));
      const mockSocketForBroadcast = {
        ...mockSocket,
        to: mockTo,
      } as unknown as AuthenticatedSocket;

      broadcastToSubset(mockSocketForBroadcast, ['user-1', 'user-2'], 'test-event', { data: 'test' });

      expect(SessionRegistry.getSocket).toHaveBeenCalledWith('user-1');
      expect(SessionRegistry.getSocket).toHaveBeenCalledWith('user-2');
      expect(mockTo).toHaveBeenCalledWith('target-socket-1');
      expect(mockEmit).toHaveBeenCalledWith('test-event', {
        data: 'test',
        userId: 'session-1',
      });
    });
  });
});
