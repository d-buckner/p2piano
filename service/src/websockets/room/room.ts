import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
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
      Logger.warn(`User denied connection due to invalid metadata ${JSON.stringify({ roomId, userId: sessionId })}`);
      socket.disconnect();
      return;
    }

    try {
      await SessionProvider.get(sessionId);
    } catch {
      Logger.warn(`User denied connection due to invalid session ${sessionId}`);
      socket.disconnect();
      return;
    }

    const prevSocket = SessionRegistry.getSocket(sessionId);
    SessionRegistry.registerSession(sessionId, socket);
    // Disconnect existing connection if exists
    prevSocket?.disconnect();

    const roomEntity = new RoomEntity(roomId);

    try {
      // Retry logic for race condition handling in the case the room was just created
      const roomData = await this.retryRoomJoin(roomEntity, sessionId, displayName as string, 3);

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

      Logger.log(`Session ${sessionId} connected to room ${roomId}`);
    } catch (err) {
      console.error(err);
      SessionRegistry.destroySession(sessionId);
      socket.disconnect();
    }
  }

  private async retryRoomJoin(roomEntity: RoomEntity, sessionId: string, displayName: string, maxRetries: number): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await roomEntity.join(sessionId, displayName);
      } catch (err) {
        if (attempt >= maxRetries) throw err;

        // Exponential backoff: 50ms, 100ms, 200ms
        const delay = 50 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));

        Logger.warn(`Room join attempt ${attempt} failed for session ${sessionId}, retrying in ${delay}ms`);
      }
    }
  }

  async destroyConnection(socket: Socket, reason: string) {
    const {
      sessionId,
      roomId,
    } = getSocketMetadata(socket);

    if (!sessionId || !roomId) return;

    const roomEntity = new RoomEntity(roomId);

    if (SessionRegistry.getSocket(sessionId)?.id !== socket.id) {
      Logger.log(`Session ${sessionId} reconnected to room ${roomId} due to ${reason}`);
      return;
    }

    SessionRegistry.destroySession(sessionId);

    try {
      const roomData = await roomEntity.leave(sessionId);
      broadcast(socket, RoomEvents.USER_DISCONNECT, {
        userId: sessionId,
        room: roomData,
      });
    } catch (err) {
      Logger.error(`Failed to leave room for session ${sessionId}:`, err);
    }

    Logger.log(`Session ${sessionId} disconnected from room ${roomId} due to ${reason}`);
  }
}
