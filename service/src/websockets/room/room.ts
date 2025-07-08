import { Logger, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import RoomEntity from '../../entities/Room';
import { WebSocketError, RoomError } from '../../errors';
import { WsThrottlerGuard } from '../../guards/throttler.guard';
import { WsValidationPipe } from '../../pipes/ws-validation.pipe';
import { SessionValidatorService } from '../../services/session-validator.service';
import { getErrorMessage } from '../../utils/ErrorUtils';
import SessionRegistry from '../SessionRegistry';
import {
  broadcast,
  getWebSocketGatewayOptions,
  getSocketMetadata,
  getSocketRoomId,
} from '../utils';
import { RoomEvents, SocketEvents } from './events';
import type { UserUpdateDto } from '../../dto/ws/user-update.dto';
import type { AuthenticatedSocket } from '../../types/socket';
import type { Room as IRoom } from '../../utils/workspaceTypes';
import type { Server } from 'socket.io';

// Socket interface is now extended in types/socket.ts

/**
 * WebSocket gateway handling real-time room operations.
 * 
 * Manages user connections, room joining/leaving, and user updates
 * with proper authentication, throttling, and error handling.
 * 
 * Features:
 * - Session-based authentication for WebSocket connections
 * - Rate limiting to prevent abuse
 * - Automatic reconnection handling
 * - Room state synchronization
 */
@WebSocketGateway(getWebSocketGatewayOptions())
export class Room {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly sessionValidator: SessionValidatorService) {
    this.bootstrapConnection = this.bootstrapConnection.bind(this);
    this.destroyConnection = this.destroyConnection.bind(this);
  }

  @Throttle({ default: { limit: 60, ttl: 30000 } }) // 2 updates per second allows for smooth real-time collaboration
  @UseGuards(WsThrottlerGuard)
  @SubscribeMessage(RoomEvents.USER_UPDATE)
  async onUserUpdate(@MessageBody(new WsValidationPipe()) payload: UserUpdateDto, @ConnectedSocket() socket: AuthenticatedSocket) {
    const roomId = getSocketRoomId(socket);
    const roomEntity = new RoomEntity(roomId);
    const roomData = await roomEntity.updateUser(payload);
    this.server.in(roomId).emit(RoomEvents.USER_UPDATE, {
      userId: payload.userId,
      room: roomData,
    });
  }

  onModuleInit() {
    this.server.on(SocketEvents.CONNECTION, (socket) => this.bootstrapConnection(socket as AuthenticatedSocket));
  }

  onModuleDestroy() {
    this.server.off(SocketEvents.CONNECTION, this.bootstrapConnection);
  }

  async bootstrapConnection(socket: AuthenticatedSocket): Promise<void> {
    const { displayName, roomId } = getSocketMetadata(socket);

    if (!roomId) {
      Logger.warn('User denied connection due to missing roomId');
      socket.disconnect();
      return;
    }

    // Session is already validated by SessionIoAdapter at transport level
    // Now we just need to attach it to the socket for use in handlers
    try {
      const isValid = await this.sessionValidator.validateAndAttachToSocket(socket);
      
      // This should always succeed since the adapter already validated it
      if (!isValid) {
        Logger.error('Unexpected: session validation failed after adapter validation');
        socket.disconnect();
        return;
      }

      // Check for existing socket before registering new one
      const prevSocketMetadata = await SessionRegistry.getSocketMetadata(socket.session.sessionId);
      await SessionRegistry.registerSession(socket.session.sessionId, socket);
      
      // Disconnect existing connection if exists and is local to this server
      if (prevSocketMetadata && prevSocketMetadata.serverId === SessionRegistry.getServerId()) {
        const prevSocket = this.server.sockets.sockets.get(prevSocketMetadata.socketId);
        prevSocket?.disconnect();
      }

      const roomEntity = new RoomEntity(roomId);

      try {
        // Retry logic for race condition handling in the case the room was just created
        const roomData = await this.retryRoomJoin(roomEntity, socket.session.sessionId, displayName as string, 5);

        // Join both the shared room (for room-wide broadcasts) and personal room (for direct user targeting)
        socket.join(roomId);
        socket.join(socket.session.sessionId);
        socket.on(SocketEvents.DISCONNECT, reason => this.destroyConnection(socket, reason));

        if (prevSocketMetadata) {
          // Client reconnect, no need to send connection events
          return;
        }

        broadcast(socket, RoomEvents.USER_CONNECT, {
          userId: socket.session.sessionId,
          room: roomData,
        });

        socket.emit(RoomEvents.ROOM_JOIN, {
          userId: socket.session.sessionId,
          room: roomData,
        });

        Logger.log(`Session ${socket.session.sessionId} connected to room ${roomId}`, 'RoomGateway');
        Logger.debug(`Room ${roomId} now has ${Object.keys(roomData.users || {}).length} users`, 'RoomGateway');
      } catch (err) {
        const roomError = new RoomError(`Failed to join room ${roomId}`, {
          sessionId: socket.session.sessionId,
          roomId,
          originalError: getErrorMessage(err),
        });
        Logger.error(roomError);
        await SessionRegistry.destroySession(socket.session.sessionId);
        socket.disconnect();
      }
    } catch (error) {
      const wsError = new WebSocketError('Session authentication failed', {
        roomId,
        clientIP: socket.session?.ipAddress || 'unknown',
        originalError: getErrorMessage(error),
      });
      Logger.warn(wsError);
      socket.disconnect();
      return;
    }
  }

  private async retryRoomJoin(roomEntity: RoomEntity, sessionId: string, displayName: string, maxRetries: number): Promise<IRoom> {
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
    // This should never be reached since we throw on maxRetries, but TypeScript requires it
    throw new Error('Failed to join room after maximum retries');
  }

  async destroyConnection(socket: AuthenticatedSocket, reason: string): Promise<void> {
    const {
      sessionId,
      roomId,
    } = getSocketMetadata(socket);

    if (!sessionId || !roomId) return;

    const roomEntity = new RoomEntity(roomId);

    const socketMetadata = await SessionRegistry.getSocketMetadata(sessionId);
    if (!socketMetadata || socketMetadata.socketId !== socket.id) {
      Logger.log(`Session ${sessionId} reconnected to room ${roomId} due to ${reason}`);
      return;
    }

    await SessionRegistry.destroySession(sessionId);

    try {
      const roomData = await roomEntity.leave(sessionId);
      broadcast(socket, RoomEvents.USER_DISCONNECT, {
        userId: sessionId,
        room: roomData,
      });
    } catch (err) {
      Logger.error(`Failed to leave room for session ${sessionId}:`, err);
    }

    Logger.log(`Session ${sessionId} disconnected from room ${roomId} due to ${reason}`, 'RoomGateway');
    Logger.debug(`Disconnect reason: ${reason}`, 'RoomGateway');
  }


}
