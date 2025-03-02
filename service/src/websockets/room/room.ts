import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WsThrottlerGuard } from '../../guards/throttler.guard';
import {
  broadcast,
  defaultWebSocketGatewayOptions,
  getSocketMetadata,
  getSocketRoomId,
} from '../utils';
import { RoomEvents, SocketEvents } from './events';
import RoomEntity from '../../entities/Room';
import SessionProvider from '../../entities/Session';
import { UserUpdatePayload } from './payloads';
import SessionRegistry from '../SessionRegistry';
import Logger from '../../utils/Logger';

import type { Server, Socket } from 'socket.io';

@WebSocketGateway(defaultWebSocketGatewayOptions)
export class Room {
  @WebSocketServer()
  server: Server;

  constructor() {
    this.bootstrapConnection = this.bootstrapConnection.bind(this);
    this.destroyConnection = this.destroyConnection.bind(this);
  }

  @Throttle(10, 30)
  @UseGuards(WsThrottlerGuard)
  @SubscribeMessage(RoomEvents.USER_UPDATE)
  async onUserUpdate(@MessageBody() payload: UserUpdatePayload, @ConnectedSocket() socket: Socket) {
    const roomId = getSocketRoomId(socket);
    const roomEntity = new RoomEntity(roomId);
    const roomData = await roomEntity.updateUser(payload);
    this.server.in(roomId).emit(RoomEvents.USER_UPDATE, {
      userId: payload.userId,
      room: roomData,
    });
  }

  onModuleInit() {
    this.server.on(SocketEvents.CONNECTION, this.bootstrapConnection);
  }

  onModuleDestroy() {
    this.server.off(SocketEvents.CONNECTION, this.bootstrapConnection);
  }

  async bootstrapConnection(socket: Socket) {
    const {
      displayName,
      sessionId,
      roomId,
    } = getSocketMetadata(socket);
    if (!roomId || !sessionId) {
      Logger.WARN(`User denied connection due to invalid cookies ${JSON.stringify({ roomId, userId: sessionId })}`);
      socket.disconnect();
      return;
    }
    try {
      await SessionProvider.get(sessionId);
    } catch {
      Logger.WARN(`User denied connection due to invalid session ${sessionId}`);
      socket.disconnect();
    }

    const prevSocket = SessionRegistry.getSocket(sessionId);
    SessionRegistry.registerSession(sessionId, socket);
    // Disconnect existing connection if exists
    prevSocket?.disconnect();

    const roomEntity = new RoomEntity(roomId);

    try {
      const roomData = await roomEntity.join(sessionId, displayName as string);
      socket.join(roomId);
      socket.on(SocketEvents.DISCONNECT, reason => this.destroyConnection(socket, reason));

      if (prevSocket) {
        // Client reconnect, no need to send connection events
        return;
      }

      broadcast(socket, RoomEvents.USER_CONNECT, {
        userId: sessionId,
        room: roomData,
      });

      socket.emit(RoomEvents.ROOM_JOIN, {
        userId: sessionId,
        room: roomData,
      });

      Logger.INFO(`Session ${sessionId} connected to room ${roomId}`);
    } catch (err) {
      console.error(err);
      SessionRegistry.destroySession(sessionId);
      socket.disconnect();
    }
  }

  async destroyConnection(socket: Socket, reason: string) {
    const {
      sessionId,
      roomId,
    } = getSocketMetadata(socket);
    const roomEntity = new RoomEntity(roomId);

    if (SessionRegistry.getSocket(sessionId)?.id !== socket.id) {
      // Session has swapped sockets from socketio reconnection
      Logger.INFO(`Session ${sessionId} reconnected to room ${roomId} due to ${reason}`);
      return;
    }

    SessionRegistry.destroySession(sessionId);

    broadcast(socket, RoomEvents.USER_DISCONNECT, {
      userId: sessionId,
      room: await roomEntity.leave(sessionId),
    });

    Logger.INFO(`Session ${sessionId} disconnected to room ${roomId} due to ${reason}`);
  }
}
