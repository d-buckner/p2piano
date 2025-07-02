import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  defaultWebSocketGatewayOptions,
  getSocketSessionId,
  getSocketRoomId,
  getSocketDisplayName,
  getSocketMetadata,
  broadcast,
  broadcastToSubset,
} from './utils';
import SessionRegistry from './SessionRegistry';
import type { Socket } from 'socket.io';
import type { Session } from '../entities/Session';

// Mock dependencies
vi.mock('./SessionRegistry');
vi.mock('../config/ConfigProvider');

describe('WebSocket Utils', () => {
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSocket = {
      id: 'socket-123',
      handshake: {
        query: {
          roomId: 'room-456',
          displayName: 'Test User',
        },
        headers: {},
        time: new Date().toISOString(),
        address: '127.0.0.1',
        xdomain: false,
        secure: false,
        issued: Date.now(),
        url: '/socket.io',
        auth: {},
      } as any,
      session: {
        sessionId: 'session-789',
        userId: 'user-123',
        createdAt: new Date(),
        lastActivity: new Date(),
      } as Session,
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
  });

  describe('defaultWebSocketGatewayOptions', () => {
    it('should provide valid gateway configuration', () => {
      const options = defaultWebSocketGatewayOptions;
      
      expect(options.namespace).toBe('api');
      expect(options.cors).toBeDefined();
      expect(typeof options.cors).toBe('object');
    });
  });

  describe('getSocketSessionId', () => {
    it('should return session ID when session exists', () => {
      const sessionId = getSocketSessionId(mockSocket as Socket);
      
      expect(sessionId).toBe('session-789');
    });

    it('should return null when session is undefined', () => {
      mockSocket.session = undefined;
      
      const sessionId = getSocketSessionId(mockSocket as Socket);
      
      expect(sessionId).toBeNull();
    });

    it('should return null when session exists but sessionId is undefined', () => {
      mockSocket.session = { sessionId: undefined } as any;
      
      const sessionId = getSocketSessionId(mockSocket as Socket);
      
      expect(sessionId).toBeNull();
    });
  });

  describe('getSocketRoomId', () => {
    it('should extract room ID from handshake query', () => {
      const roomId = getSocketRoomId(mockSocket as Socket);
      
      expect(roomId).toBe('room-456');
    });

    it('should handle missing room ID gracefully', () => {
      if (mockSocket.handshake) {
        mockSocket.handshake.query = {};
      }
      
      const roomId = getSocketRoomId(mockSocket as Socket);
      
      expect(roomId).toBeUndefined();
    });
  });

  describe('getSocketDisplayName', () => {
    it('should extract display name from handshake query', () => {
      const displayName = getSocketDisplayName(mockSocket as Socket);
      
      expect(displayName).toBe('Test User');
    });

    it('should handle missing display name gracefully', () => {
      if (mockSocket.handshake) {
        mockSocket.handshake.query = {};
      }
      
      const displayName = getSocketDisplayName(mockSocket as Socket);
      
      expect(displayName).toBeUndefined();
    });
  });

  describe('getSocketMetadata', () => {
    it('should return complete socket metadata', () => {
      const metadata = getSocketMetadata(mockSocket as Socket);
      
      expect(metadata).toEqual({
        displayName: 'Test User',
        sessionId: 'session-789',
        roomId: 'room-456',
      });
    });

    it('should handle partial metadata gracefully', () => {
      mockSocket.session = undefined;
      if (mockSocket.handshake) {
        mockSocket.handshake.query = { roomId: 'room-456' };
      }
      
      const metadata = getSocketMetadata(mockSocket as Socket);
      
      expect(metadata).toEqual({
        displayName: undefined,
        sessionId: null,
        roomId: 'room-456',
      });
    });
  });

  describe('broadcast', () => {
    it('should broadcast message to room with decorated payload', () => {
      const payload = { type: 'NOTE_PLAYED', note: 'C4' };
      
      broadcast(mockSocket as Socket, 'note', payload);
      
      expect(mockSocket.to).toHaveBeenCalledWith('room-456');
      expect(mockSocket.emit).toHaveBeenCalledWith('note', {
        type: 'NOTE_PLAYED',
        note: 'C4',
        userId: 'session-789',
      });
    });

    it('should handle payload with existing userId by overriding it', () => {
      const payload = { type: 'NOTE_PLAYED', note: 'C4', userId: 'old-user' };
      
      broadcast(mockSocket as Socket, 'note', payload);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('note', {
        type: 'NOTE_PLAYED',
        note: 'C4',
        userId: 'session-789', // Should override the old userId
      });
    });

    it('should broadcast with null userId when session is missing', () => {
      mockSocket.session = undefined;
      const payload = { type: 'USER_LEFT' };
      
      broadcast(mockSocket as Socket, 'user-event', payload);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('user-event', {
        type: 'USER_LEFT',
        userId: null,
      });
    });

    it('should handle empty payload', () => {
      const payload = {};
      
      broadcast(mockSocket as Socket, 'heartbeat', payload);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('heartbeat', {
        userId: 'session-789',
      });
    });

    it('should preserve complex nested payload structure', () => {
      const payload = {
        type: 'COMPLEX_EVENT',
        data: {
          nested: {
            value: 42,
            array: [1, 2, 3],
          },
        },
        metadata: {
          timestamp: Date.now(),
        },
      };
      
      broadcast(mockSocket as Socket, 'complex', payload);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('complex', {
        ...payload,
        userId: 'session-789',
      });
    });
  });

  describe('broadcastToSubset', () => {
    beforeEach(() => {
      // Mock SessionRegistry.getSocket
      vi.mocked(SessionRegistry.getSocket).mockImplementation((userId: string) => {
        const socketMap: Record<string, Partial<Socket>> = {
          'user-1': { id: 'socket-1' },
          'user-2': { id: 'socket-2' },
          'user-3': { id: 'socket-3' },
        };
        return socketMap[userId] as Socket || null;
      });
    });

    it('should broadcast to specific subset of users', () => {
      const targetUsers = ['user-1', 'user-2'];
      const payload = { type: 'PRIVATE_MESSAGE', content: 'Hello specific users' };
      
      broadcastToSubset(mockSocket as Socket, targetUsers, 'private-message', payload);
      
      expect(mockSocket.to).toHaveBeenCalledTimes(2);
      expect(mockSocket.to).toHaveBeenCalledWith('socket-1');
      expect(mockSocket.to).toHaveBeenCalledWith('socket-2');
      expect(mockSocket.emit).toHaveBeenCalledTimes(2);
      expect(mockSocket.emit).toHaveBeenCalledWith('private-message', {
        type: 'PRIVATE_MESSAGE',
        content: 'Hello specific users',
        userId: 'session-789',
      });
    });

    it('should handle empty user list', () => {
      const payload = { type: 'EMPTY_BROADCAST' };
      
      broadcastToSubset(mockSocket as Socket, [], 'empty', payload);
      
      expect(mockSocket.to).not.toHaveBeenCalled();
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should handle mix of valid and invalid users gracefully', () => {
      vi.mocked(SessionRegistry.getSocket).mockImplementation((userId: string) => {
        return userId === 'valid-user' ? { id: 'socket-1' } as Socket : null;
      });
      
      const targetUsers = ['valid-user', 'invalid-user'];
      const payload = { type: 'MIXED_BROADCAST' };
      
      broadcastToSubset(mockSocket as Socket, targetUsers, 'mixed', payload);
      
      // Should attempt broadcast to all users, valid or not
      expect(mockSocket.to).toHaveBeenCalledWith('socket-1');
      expect(mockSocket.to).toHaveBeenCalledWith(undefined);
    });

    it('should handle null socket from SessionRegistry gracefully', () => {
      vi.mocked(SessionRegistry.getSocket).mockReturnValue(null);
      
      const targetUsers = ['user-1'];
      const payload = { type: 'NULL_SOCKET_TEST' };
      
      broadcastToSubset(mockSocket as Socket, targetUsers, 'null-test', payload);
      
      // Should attempt to call .to() with undefined socketId
      expect(mockSocket.to).toHaveBeenCalledWith(undefined);
      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
    });

    it('should preserve payload structure in subset broadcasts', () => {
      const targetUsers = ['user-1'];
      const payload = {
        type: 'COMPLEX_SUBSET',
        data: { nested: { value: 'test' } },
        array: [1, 2, 3],
      };
      
      broadcastToSubset(mockSocket as Socket, targetUsers, 'complex-subset', payload);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('complex-subset', {
        type: 'COMPLEX_SUBSET',
        data: { nested: { value: 'test' } },
        array: [1, 2, 3],
        userId: 'session-789',
      });
    });

    it('should handle single user in subset', () => {
      const targetUsers = ['user-1'];
      const payload = { type: 'SINGLE_USER_MESSAGE' };
      
      broadcastToSubset(mockSocket as Socket, targetUsers, 'single', payload);
      
      expect(mockSocket.to).toHaveBeenCalledTimes(1);
      expect(mockSocket.to).toHaveBeenCalledWith('socket-1');
      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should handle missing session across all functions', () => {
      mockSocket.session = undefined;
      
      const sessionId = getSocketSessionId(mockSocket as Socket);
      const metadata = getSocketMetadata(mockSocket as Socket);
      
      expect(sessionId).toBeNull();
      expect(metadata.sessionId).toBeNull();
      
      // Should still work for broadcasting
      broadcast(mockSocket as Socket, 'test', { data: 'test' });
      expect(mockSocket.emit).toHaveBeenCalledWith('test', {
        data: 'test',
        userId: null,
      });
    });

    it('should handle missing handshake query gracefully', () => {
      const socketWithEmptyQuery = {
        ...mockSocket,
        handshake: {
          query: {},
          headers: {},
          time: new Date().toISOString(),
          address: '127.0.0.1',
          xdomain: false,
          secure: false,
          issued: Date.now(),
          url: '/socket.io',
          auth: {},
        } as any,
      };
      
      const roomId = getSocketRoomId(socketWithEmptyQuery as Socket);
      const displayName = getSocketDisplayName(socketWithEmptyQuery as Socket);
      const metadata = getSocketMetadata(socketWithEmptyQuery as Socket);
      
      expect(roomId).toBeUndefined();
      expect(displayName).toBeUndefined();
      expect(metadata.roomId).toBeUndefined();
      expect(metadata.displayName).toBeUndefined();
    });

    it('should work with real-world WebRTC signaling payload', () => {
      const signalingPayload = {
        type: 'offer',
        sdp: 'v=0\r\no=- 123456789 123456789 IN IP4 0.0.0.0\r\n...',
        targetPeerId: 'peer-123',
      };
      
      broadcast(mockSocket as Socket, 'webrtc-signal', signalingPayload);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('webrtc-signal', {
        type: 'offer',
        sdp: 'v=0\r\no=- 123456789 123456789 IN IP4 0.0.0.0\r\n...',
        targetPeerId: 'peer-123',
        userId: 'session-789',
      });
    });

    it('should work with real-world note event payload', () => {
      const notePayload = {
        note: 'C4',
        velocity: 127,
        timestamp: Date.now(),
        instrumentType: 'piano',
      };
      
      broadcast(mockSocket as Socket, 'note-on', notePayload);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('note-on', {
        note: 'C4',
        velocity: 127,
        timestamp: notePayload.timestamp,
        instrumentType: 'piano',
        userId: 'session-789',
      });
    });
  });
});