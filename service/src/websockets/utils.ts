import ConfigProvider from '../config/ConfigProvider';
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

/**
 * Broadcasts a message to specific users by their session IDs.
 * 
 * ARCHITECTURE NOTE:
 * - Each user joins two rooms on connection: roomId (shared) + sessionId (personal)
 * - sessionId serves as both the user identifier AND their personal room name
 * 
 * @param socket - The authenticated socket sending the message
 * @param sessionIds - Array of session IDs (user identifiers) to target
 * @param eventType - WebSocket event type to emit
 * @param payload - Data payload to send
 */
export function broadcastToSubset<T>(socket: AuthenticatedSocket, sessionIds: string[], eventType: string, payload: T) {
  const sessionId = getSocketSessionId(socket);
  if (!sessionId) {
    throw new Error('Socket session ID is required for broadcasting');
  }
  const decoratedPayload: T & { userId: string } = {
    ...payload,
    userId: sessionId, // Keep "userId" in payload for client compatibility
  };

  // Direct room targeting - each user has their own room named after their sessionId
  // Redis adapter handles cross-server routing automatically
  sessionIds.forEach((targetSessionId) => {
    socket.to(targetSessionId).emit(eventType, decoratedPayload);
  });
}
