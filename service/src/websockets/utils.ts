import SessionRegistry from './SessionRegistry';

import type { Socket } from 'socket.io';

export const defaultWebSocketGatewayOptions = {
  namespace: 'api',
  cors: true,
};

export function getSocketSessionId(socket: Socket) {
  return getSocketHandshakeQuery(socket).sessionId as string;
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
    sessionId: getSocketSessionId(socket),
    roomId: getSocketRoomId(socket),
  }
}

export function broadcast<T>(socket: Socket, eventType: string, payload: T) {
  const roomId = getSocketRoomId(socket);
  const userId = getSocketSessionId(socket);
  const decoratedPayload: T & { userId: string } = {
    ...payload,
    userId,
  };
  socket.to(roomId).emit(eventType, decoratedPayload);
}

export function broadcastToSubset<T>(socket: Socket, userIds: string[], eventType: string, payload: T) {
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
