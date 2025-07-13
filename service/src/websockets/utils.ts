import ConfigProvider from '../config/ConfigProvider';
import { applicationMetrics } from '../telemetry/metrics';
import type { Socket } from 'socket.io';


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

export function extractSessionIdFromSocket(socket: Socket): string | null {
  // Check handshake auth first
  const auth = socket.handshake?.auth;
  if (auth?.sessionId) {
    return auth.sessionId;
  }

  // Check cookies (secure, HttpOnly)
  const cookies = socket.handshake.headers.cookie;
  if (cookies) {
    const match = cookies.match(/sessionId=([^;]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function getSocketRoomId(socket: Socket) {
  return getSocketHandshakeQuery(socket).roomId as string;
}

export function getSocketDisplayName(socket: Socket) {
  return getSocketHandshakeQuery(socket).displayName as string;
}

function getSocketHandshakeQuery(socket: Socket) {
  return socket.handshake.query;
}

export function getSocketMetadata(socket: Socket) {
  return {
    displayName: getSocketDisplayName(socket),
    sessionId: extractSessionIdFromSocket(socket),
    roomId: getSocketRoomId(socket),
  };
}

export function sendTo<T>(socket: Socket, sessionId: string, eventType: string, payload: T) {
  socket.to(sessionId).emit(eventType, payload);
  recordWebSocketMessage(socket, eventType);
}

export function broadcast<T>(socket: Socket, eventType: string, payload: T) {
  const roomId = getSocketRoomId(socket);
  const userId = extractSessionIdFromSocket(socket);
  if (!userId) {
    throw new Error('Socket session ID is required for broadcasting');
  }
  const decoratedPayload: T & { userId: string } = {
    ...payload,
    userId,
  };
  socket.to(roomId).emit(eventType, decoratedPayload);
  recordWebSocketMessage(socket, eventType);
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
export function broadcastToSubset<T>(socket: Socket, sessionIds: string[], eventType: string, payload: T) {
  const sessionId = extractSessionIdFromSocket(socket);
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
  
  // Record one metric per broadcast (not per target)
  recordWebSocketMessage(socket, eventType);
}

function recordWebSocketMessage(socket: Socket, eventType: string) {
  applicationMetrics.recordWebSocketMessage(eventType, extractSessionIdFromSocket(socket) ?? 'unknown');
}
