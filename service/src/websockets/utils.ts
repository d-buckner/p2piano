import ConfigProvider from '../config/ConfigProvider';
import SessionRegistry from './SessionRegistry';
import type { AuthenticatedSocket } from '../types/socket';


export function getWebSocketGatewayOptions() {
  return {
    namespace: 'api',
    cors: ConfigProvider.isProduction()
      ? false
      : {
        credentials: true,
        origin: 'http://localhost:5173',
      }
  };
}

export function getSocketSessionId(socket: AuthenticatedSocket) {
  // Get sessionId from the session attached by auth guard
  return socket.session?.sessionId || null;
}

export function getSocketRoomId(socket: AuthenticatedSocket) {
  return getSocketHandshakeQuery(socket).roomId as string;
}

export function getSocketDisplayName(socket: AuthenticatedSocket) {
  return getSocketHandshakeQuery(socket).displayName as string;
}

function getSocketHandshakeQuery(socket: AuthenticatedSocket) {
  return socket.handshake.query;
}

export function getSocketMetadata(socket: AuthenticatedSocket) {
  return {
    displayName: getSocketDisplayName(socket),
    sessionId: getSocketSessionId(socket),
    roomId: getSocketRoomId(socket),
  };
}

export function broadcast<T>(socket: AuthenticatedSocket, eventType: string, payload: T) {
  const roomId = getSocketRoomId(socket);
  const userId = getSocketSessionId(socket);
  if (!userId) {
    throw new Error('Socket session ID is required for broadcasting');
  }
  const decoratedPayload: T & { userId: string } = {
    ...payload,
    userId,
  };
  socket.to(roomId).emit(eventType, decoratedPayload);
}

export function broadcastToSubset<T>(socket: AuthenticatedSocket, userIds: string[], eventType: string, payload: T) {
  const userId = getSocketSessionId(socket);
  if (!userId) {
    throw new Error('Socket session ID is required for broadcasting');
  }
  const decoratedPayload: T & { userId: string } = {
    ...payload,
    userId,
  };

  // Process each target user ID
  userIds.forEach(async (targetUserId) => {
    try {
      const socketMetadata = await SessionRegistry.getSocketMetadata(targetUserId);
      if (!socketMetadata) {
        return; // User not found
      }

      if (socketMetadata.serverId === SessionRegistry.getServerId()) {
        // Local server - route directly to socket
        socket.to(socketMetadata.socketId).emit(eventType, decoratedPayload);
      } else {
        // Different server - use Socket.IO adapter for cross-server communication
        socket.to(targetUserId).emit(eventType, decoratedPayload);
      }
    } catch (error) {
      // Log error but don't throw - broadcasting to other users should continue
      console.warn(`Failed to route message to user ${targetUserId}:`, error);
    }
  });
}
