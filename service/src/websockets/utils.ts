import SessionRegistry from './SessionRegistry';
import ConfigProvider from '../config/ConfigProvider';
import type { AuthenticatedSocket } from '../types/socket';


export const defaultWebSocketGatewayOptions = {
  namespace: 'api',
  cors: ConfigProvider.isProduction()
    ? false
    : {
      credentials: true,
      origin: 'http://localhost:5173',
    },
};

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
  }
}

export function broadcast<T>(socket: AuthenticatedSocket, eventType: string, payload: T) {
  const roomId = getSocketRoomId(socket);
  const userId = getSocketSessionId(socket);
  const decoratedPayload: T & { userId: string } = {
    ...payload,
    userId,
  };
  socket.to(roomId).emit(eventType, decoratedPayload);
}

export function broadcastToSubset<T>(socket: AuthenticatedSocket, userIds: string[], eventType: string, payload: T) {
  const userId = getSocketSessionId(socket);
  const decoratedPayload: T & { userId: string } = {
    ...payload,
    userId,
  };

  userIds.forEach(userId => {
    const socketId = SessionRegistry.getSocket(userId)?.id;
    socket.to(socketId).emit(eventType, decoratedPayload);
  });
}
