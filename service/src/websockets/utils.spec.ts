import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConfigProvider from '../config/ConfigProvider';
import { getWebSocketGatewayOptions, extractSessionIdFromSocket, getSocketRoomId, getSocketDisplayName, getSocketMetadata, broadcast, broadcastToSubset } from './utils';
import type { Socket } from 'socket.io';

// Mock ConfigProvider
vi.mock('../config/ConfigProvider', () => ({
  default: {
    isProduction: vi.fn(),
  },
}));

// Note: SessionRegistry mocking removed as it's no longer used in utils.ts

describe('websockets/utils', () => {
  const mockSocket = {
    id: 'socket-1',
    session: { sessionId: 'session-1' },
    handshake: {
      query: {
        roomId: 'room-1',
        displayName: 'Test User',
      },
      headers: {
        cookie: 'sessionId=session-1; path=/',
      },
      auth: {
        sessionId: 'session-1',
      },
    },
    to: vi.fn(() => ({ emit: vi.fn() })),
    emit: vi.fn(),
  } as unknown as Socket;

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

  describe('extractSessionIdFromSocket', () => {
    it('should return session id when session exists', () => {
      const result = extractSessionIdFromSocket(mockSocket);
      expect(result).toBe('session-1');
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
      } as unknown as Socket;

      broadcast(mockSocketForBroadcast, 'test-event', { data: 'test' });

      expect(mockTo).toHaveBeenCalledWith('room-1');
      expect(mockEmit).toHaveBeenCalledWith('test-event', {
        data: 'test',
        userId: 'session-1',
      });
    });
  });

  describe('broadcastToSubset', () => {
    it('should broadcast to user rooms directly', () => {
      const mockEmit = vi.fn();
      const mockTo = vi.fn(() => ({ emit: mockEmit }));
      const mockSocketForBroadcast = {
        ...mockSocket,
        to: mockTo,
      } as unknown as Socket;

      broadcastToSubset(mockSocketForBroadcast, ['user-1', 'user-2'], 'test-event', { data: 'test' });

      // Should emit to each user's room directly (no async operations)
      expect(mockTo).toHaveBeenCalledWith('user-1');
      expect(mockTo).toHaveBeenCalledWith('user-2');
      expect(mockEmit).toHaveBeenCalledTimes(2);
      expect(mockEmit).toHaveBeenCalledWith('test-event', {
        data: 'test',
        userId: 'session-1',
      });
    });

    it('should handle single user broadcast', () => {
      const mockEmit = vi.fn();
      const mockTo = vi.fn(() => ({ emit: mockEmit }));
      const mockSocketForBroadcast = {
        ...mockSocket,
        to: mockTo,
      } as unknown as Socket;

      broadcastToSubset(mockSocketForBroadcast, ['user-1'], 'test-event', { data: 'test' });

      // Should emit to user's room directly
      expect(mockTo).toHaveBeenCalledWith('user-1');
      expect(mockEmit).toHaveBeenCalledWith('test-event', {
        data: 'test',
        userId: 'session-1',
      });
    });

    it('should handle empty user list gracefully', () => {
      const mockEmit = vi.fn();
      const mockTo = vi.fn(() => ({ emit: mockEmit }));
      const mockSocketForBroadcast = {
        ...mockSocket,
        to: mockTo,
      } as unknown as Socket;

      // Should not throw
      expect(() => {
        broadcastToSubset(mockSocketForBroadcast, [], 'test-event', { data: 'test' });
      }).not.toThrow();

      // Should not emit anything
      expect(mockTo).not.toHaveBeenCalled();
      expect(mockEmit).not.toHaveBeenCalled();
    });
  });
});
