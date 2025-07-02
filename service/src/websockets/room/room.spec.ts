import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Logger } from '@nestjs/common';
import { Room } from './room';
import { RoomEvents, SocketEvents } from './events';
import RoomEntity from '../../entities/Room';
import SessionProvider from '../../entities/Session';
import SessionRegistry from '../SessionRegistry';
import { SessionExtractor } from '../../utils/session-extractor';
import { createMockSessionWithId, createUUID } from '../../test-utils/validation.helpers';

// Mock dependencies
vi.mock('../../entities/Room');
vi.mock('../../entities/Session');
vi.mock('../SessionRegistry');
vi.mock('../../utils/session-extractor');
vi.mock('../../errors');
vi.mock('@nestjs/common');
vi.mock('../utils', () => ({
  broadcast: vi.fn(),
  defaultWebSocketGatewayOptions: {},
  getSocketMetadata: vi.fn(),
  getSocketRoomId: vi.fn(),
}));

describe('Room WebSocket Gateway', () => {
  let roomGateway: Room;
  let mockServer: any;
  let mockSocket: any;
  let mockSessionProvider: any;
  let mockSessionExtractor: any;
  let mockSessionRegistry: any;
  let mockRoomEntity: any;
  let mockLogger: any;
  let mockUtils: any;

  beforeEach(async () => {
    // Mock Server
    mockServer = {
      on: vi.fn(),
      off: vi.fn(),
      in: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };

    // Mock Socket
    mockSocket = {
      id: 'socket-123',
      disconnect: vi.fn(),
      join: vi.fn(),
      on: vi.fn(),
      emit: vi.fn(),
      handshake: {
        address: '192.168.1.1',
        auth: {},
        query: {},
        headers: {},
      },
      conn: {
        remoteAddress: '192.168.1.1',
      },
    };

    // Mock dependencies
    mockSessionProvider = SessionProvider as any;
    mockSessionExtractor = SessionExtractor as any;
    mockSessionRegistry = SessionRegistry as any;
    mockRoomEntity = RoomEntity as any;
    mockLogger = Logger as any;

    // Set up mock implementations
    mockSessionProvider.get = vi.fn();
    mockSessionExtractor.extractSessionIdFromSocket = vi.fn();
    mockSessionRegistry.getSocket = vi.fn();
    mockSessionRegistry.registerSession = vi.fn();
    mockSessionRegistry.destroySession = vi.fn();
    mockRoomEntity.mockImplementation(() => ({
      join: vi.fn(),
      leave: vi.fn(),
      updateUser: vi.fn(),
    }));

    // Mock Logger
    mockLogger.log = vi.fn();
    mockLogger.warn = vi.fn();
    mockLogger.error = vi.fn();
    mockLogger.debug = vi.fn();

    // Mock utils
    mockUtils = await import('../utils');
    mockUtils.getSocketMetadata.mockReturnValue({
      sessionId: createUUID(),
      roomId: 'room-123',
      displayName: 'Test User',
    });
    mockUtils.getSocketRoomId.mockReturnValue('room-123');
    mockUtils.broadcast = vi.fn();

    // Create gateway instance
    roomGateway = new Room();
    roomGateway.server = mockServer;

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Module lifecycle', () => {
    it('should register connection handler on module init', () => {
      roomGateway.onModuleInit();

      expect(mockServer.on).toHaveBeenCalledWith(
        SocketEvents.CONNECTION,
        roomGateway.bootstrapConnection
      );
    });

    it('should unregister connection handler on module destroy', () => {
      roomGateway.onModuleDestroy();

      expect(mockServer.off).toHaveBeenCalledWith(
        SocketEvents.CONNECTION,
        roomGateway.bootstrapConnection
      );
    });
  });

  describe('User update handling', () => {
    it('should handle user update events successfully', async () => {
      const sessionId = createUUID();
      const roomId = 'room-123';
      const payload = { userId: sessionId, displayName: 'Updated Name', color: '#ff0000', instrument: 'piano' };
      const mockRoomData = { users: { [sessionId]: { displayName: 'Updated Name' } } };

      mockUtils.getSocketRoomId.mockReturnValue(roomId);
      
      const mockRoomInstance = {
        updateUser: vi.fn().mockResolvedValue(mockRoomData),
      };
      mockRoomEntity.mockImplementation(() => mockRoomInstance);

      await roomGateway.onUserUpdate(payload, mockSocket);

      expect(mockRoomInstance.updateUser).toHaveBeenCalledWith(payload);
      expect(mockServer.in).toHaveBeenCalledWith(roomId);
      expect(mockServer.emit).toHaveBeenCalledWith(RoomEvents.USER_UPDATE, {
        userId: payload.userId,
        room: mockRoomData,
      });
    });

    it('should handle user update errors gracefully', async () => {
      const payload = { userId: createUUID(), displayName: 'Test', color: '#ff0000', instrument: 'piano' };
      const error = new Error('Update failed');

      const mockRoomInstance = {
        updateUser: vi.fn().mockRejectedValue(error),
      };
      mockRoomEntity.mockImplementation(() => mockRoomInstance);

      await expect(roomGateway.onUserUpdate(payload, mockSocket)).rejects.toThrow('Update failed');
    });
  });

  describe('Connection bootstrap', () => {
    const sessionId = createUUID();
    const roomId = 'room-123';
    const displayName = 'Test User';

    beforeEach(() => {
      mockUtils.getSocketMetadata.mockReturnValue({ sessionId, roomId, displayName });
    });

    it('should successfully bootstrap a new connection', async () => {
      const mockSession = createMockSessionWithId({ sessionId });
      const mockRoomData = { users: { [sessionId]: { displayName } } };

      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);
      mockSessionRegistry.getSocket.mockReturnValue(null); // No previous socket

      const mockRoomInstance = {
        join: vi.fn().mockResolvedValue(mockRoomData),
      };
      mockRoomEntity.mockImplementation(() => mockRoomInstance);

      await roomGateway.bootstrapConnection(mockSocket);

      expect(mockSessionExtractor.extractSessionIdFromSocket).toHaveBeenCalledWith(mockSocket);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
      expect(mockSocket.session).toBe(mockSession);
      expect(mockSessionRegistry.registerSession).toHaveBeenCalledWith(sessionId, mockSocket);
      expect(mockSocket.join).toHaveBeenCalledWith(roomId);
      expect(mockSocket.on).toHaveBeenCalledWith(SocketEvents.DISCONNECT, expect.any(Function));
      expect(mockUtils.broadcast).toHaveBeenCalledWith(mockSocket, RoomEvents.USER_CONNECT, {
        userId: sessionId,
        room: mockRoomData,
      });
      expect(mockSocket.emit).toHaveBeenCalledWith(RoomEvents.ROOM_JOIN, {
        userId: sessionId,
        room: mockRoomData,
      });
    });

    it('should handle reconnection without broadcasting events', async () => {
      const mockSession = createMockSessionWithId({ sessionId });
      const mockRoomData = { users: { [sessionId]: { displayName } } };
      const prevSocket = { disconnect: vi.fn() };

      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);
      mockSessionRegistry.getSocket.mockReturnValue(prevSocket);

      const mockRoomInstance = {
        join: vi.fn().mockResolvedValue(mockRoomData),
      };
      mockRoomEntity.mockImplementation(() => mockRoomInstance);

      await roomGateway.bootstrapConnection(mockSocket);

      expect(prevSocket.disconnect).toHaveBeenCalled();
      expect(mockSocket.join).toHaveBeenCalledWith(roomId);
      expect(mockUtils.broadcast).not.toHaveBeenCalled(); // No broadcast for reconnection
      expect(mockSocket.emit).not.toHaveBeenCalled(); // No room join event for reconnection
    });

    it('should disconnect socket when roomId is missing', async () => {
      mockUtils.getSocketMetadata.mockReturnValue({ sessionId, roomId: null, displayName });

      await roomGateway.bootstrapConnection(mockSocket);

      expect(mockLogger.warn).toHaveBeenCalledWith('User denied connection due to missing roomId');
      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should disconnect socket when sessionId is missing', async () => {
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(null);

      await roomGateway.bootstrapConnection(mockSocket);

      expect(mockLogger.warn).toHaveBeenCalledWith('User denied connection - no sessionId found');
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should disconnect socket when session is invalid', async () => {
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(null);

      await roomGateway.bootstrapConnection(mockSocket);

      expect(mockLogger.warn).toHaveBeenCalledWith(`User denied connection due to invalid session ${sessionId}`);
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should handle room join failures', async () => {
      const mockSession = createMockSessionWithId({ sessionId });
      const roomError = new Error('Room join failed');

      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);
      mockSessionRegistry.getSocket.mockReturnValue(null);

      const mockRoomInstance = {
        join: vi.fn().mockRejectedValue(roomError),
      };
      mockRoomEntity.mockImplementation(() => mockRoomInstance);

      await roomGateway.bootstrapConnection(mockSocket);

      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockSessionRegistry.destroySession).toHaveBeenCalledWith(sessionId);
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should handle session authentication errors', async () => {
      const authError = new Error('Auth failed');
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(sessionId);
      mockSessionProvider.get.mockRejectedValue(authError);

      await roomGateway.bootstrapConnection(mockSocket);

      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('Connection destruction', () => {
    const sessionId = createUUID();
    const roomId = 'room-123';

    beforeEach(() => {
      mockUtils.getSocketMetadata.mockReturnValue({ sessionId, roomId });
    });

    it('should successfully destroy connection and leave room', async () => {
      const mockRoomData = { users: {} };
      mockSessionRegistry.getSocket.mockReturnValue(mockSocket);

      const mockRoomInstance = {
        leave: vi.fn().mockResolvedValue(mockRoomData),
      };
      mockRoomEntity.mockImplementation(() => mockRoomInstance);

      await roomGateway.destroyConnection(mockSocket, 'client disconnect');

      expect(mockSessionRegistry.destroySession).toHaveBeenCalledWith(sessionId);
      expect(mockRoomInstance.leave).toHaveBeenCalledWith(sessionId);
      expect(mockUtils.broadcast).toHaveBeenCalledWith(mockSocket, RoomEvents.USER_DISCONNECT, {
        userId: sessionId,
        room: mockRoomData,
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Session ${sessionId} disconnected from room ${roomId} due to client disconnect`,
        'RoomGateway'
      );
    });

    it('should handle reconnection scenario gracefully', async () => {
      const differentSocket = { id: 'different-socket' };
      mockSessionRegistry.getSocket.mockReturnValue(differentSocket);

      await roomGateway.destroyConnection(mockSocket, 'reconnect');

      expect(mockLogger.log).toHaveBeenCalledWith(
        `Session ${sessionId} reconnected to room ${roomId} due to reconnect`
      );
      expect(mockSessionRegistry.destroySession).not.toHaveBeenCalled();
    });

    it('should handle missing metadata gracefully', async () => {
      mockUtils.getSocketMetadata.mockReturnValue({ sessionId: null, roomId: null });

      await roomGateway.destroyConnection(mockSocket, 'error');

      expect(mockSessionRegistry.destroySession).not.toHaveBeenCalled();
    });

    it('should handle room leave errors gracefully', async () => {
      const leaveError = new Error('Leave failed');
      mockSessionRegistry.getSocket.mockReturnValue(mockSocket);

      const mockRoomInstance = {
        leave: vi.fn().mockRejectedValue(leaveError),
      };
      mockRoomEntity.mockImplementation(() => mockRoomInstance);

      await roomGateway.destroyConnection(mockSocket, 'error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to leave room for session ${sessionId}:`,
        leaveError
      );
      expect(mockSessionRegistry.destroySession).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('Retry logic', () => {
    it('should successfully join room after retries', async () => {
      const sessionId = createUUID();
      const displayName = 'Test User';
      const mockRoomData = { users: { [sessionId]: { displayName } } };

      const mockRoomInstance = {
        join: vi.fn()
          .mockRejectedValueOnce(new Error('First attempt failed'))
          .mockRejectedValueOnce(new Error('Second attempt failed'))
          .mockResolvedValueOnce(mockRoomData),
      };

      const result = await (roomGateway as any).retryRoomJoin(mockRoomInstance, sessionId, displayName, 5);

      expect(result).toBe(mockRoomData);
      expect(mockRoomInstance.join).toHaveBeenCalledTimes(3);
      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries reached', async () => {
      const sessionId = createUUID();
      const displayName = 'Test User';
      const error = new Error('Persistent failure');

      const mockRoomInstance = {
        join: vi.fn().mockRejectedValue(error),
      };

      await expect((roomGateway as any).retryRoomJoin(mockRoomInstance, sessionId, displayName, 3))
        .rejects.toThrow('Persistent failure');

      expect(mockRoomInstance.join).toHaveBeenCalledTimes(3);
    });
  });

  describe('Client IP extraction', () => {
    it('should extract IP from handshake address', () => {
      const socket = {
        handshake: { address: '192.168.1.100' },
        conn: { remoteAddress: '10.0.0.1' },
      };

      const ip = (roomGateway as any).getClientIP(socket);

      expect(ip).toBe('192.168.1.100');
    });

    it('should fallback to connection remote address', () => {
      const socket = {
        handshake: { address: null },
        conn: { remoteAddress: '10.0.0.1' },
      };

      const ip = (roomGateway as any).getClientIP(socket);

      expect(ip).toBe('10.0.0.1');
    });

    it('should handle missing IP gracefully', () => {
      const socket = {
        handshake: {},
        conn: {},
      };

      const ip = (roomGateway as any).getClientIP(socket);

      expect(ip).toBeUndefined();
    });
  });
});