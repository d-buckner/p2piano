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
import { SessionService } from '../../services/session.service';
import { applicationMetrics } from '../../telemetry/metrics';
import { getErrorMessage } from '../../utils/ErrorUtils';
import {
  broadcast,
  getWebSocketGatewayOptions,
  getSocketMetadata,
  getSocketRoomId,
  extractSessionIdFromSocket,
} from '../utils';
import { RoomEvents, SocketEvents } from './events';
import type { UserUpdateDto } from '../../dto/ws/user-update.dto';
import type { Room as IRoom } from '../../utils/workspaceTypes';
import type { Socket , Server } from 'socket.io';


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

  constructor(
    private readonly sessionService: SessionService,
    private readonly sessionValidator: SessionValidatorService
  ) {
    this.bootstrapConnection = this.bootstrapConnection.bind(this);
    this.destroyConnection = this.destroyConnection.bind(this);
  }

  @Throttle({ default: { limit: 60, ttl: 30000 } }) // 2 updates per second allows for smooth real-time collaboration
  @UseGuards(WsThrottlerGuard)
  @SubscribeMessage(RoomEvents.USER_UPDATE)
  async onUserUpdate(@MessageBody(new WsValidationPipe()) payload: UserUpdateDto, @ConnectedSocket() socket: Socket) {
    const roomId = getSocketRoomId(socket);
    const roomEntity = new RoomEntity(roomId);
    const roomData = await roomEntity.updateUser(payload);
    this.server.in(roomId).emit(RoomEvents.USER_UPDATE, {
      userId: payload.userId,
      room: roomData,
    });
  }

  onModuleInit() {
    this.server.on(SocketEvents.CONNECTION, (socket) => this.bootstrapConnection(socket as Socket));
  }

  onModuleDestroy() {
    this.server.off(SocketEvents.CONNECTION, this.bootstrapConnection);
  }

  async bootstrapConnection(socket: Socket): Promise<void> {
    const { displayName, roomId } = getSocketMetadata(socket);

    if (!roomId) {
      Logger.warn('User denied connection due to missing roomId');
      socket.disconnect();
      return;
    }

    // Session is already validated by SessionIoAdapter at transport level
    // Now we extract sessionId and work with Redis-based session data
    try {
      const sessionId = extractSessionIdFromSocket(socket);
      if (!sessionId) {
        Logger.error('No sessionId found in socket handshake');
        socket.disconnect();
        return;
      }

      // Get fresh session data from Redis to ensure it's still valid
      const session = await this.sessionService.getSession(sessionId);
      if (!session) {
        Logger.error('Session not found in Redis after adapter validation');
        socket.disconnect();
        return;
      }

      // Register connection (handles disconnecting existing connections)
      const { isReconnection } = await this.sessionService.registerConnection(sessionId, socket, this.server);

      const roomEntity = new RoomEntity(roomId);

      try {
        // Retry logic for race condition handling in the case the room was just created
        const roomData = await this.retryRoomJoin(roomEntity, sessionId, displayName, 5);

        // Join both the shared room (for room-wide broadcasts) and personal room (for direct user targeting)
        socket.join(roomId);
        socket.join(sessionId);
        socket.on(SocketEvents.DISCONNECT, reason => this.destroyConnection(socket, reason));

        socket.emit(RoomEvents.ROOM_JOIN, {
          userId: sessionId,
          room: roomData,
        });

        if (isReconnection) {
          // Client reconnect, no need to send connection events
          return;
        }

        applicationMetrics.recordWebSocketConnection(roomId);

        broadcast(socket, RoomEvents.USER_CONNECT, {
          userId: sessionId,
          room: roomData,
        });

        Logger.log(`Session ${sessionId} connected to room ${roomId}`, 'RoomGateway');
        Logger.debug(`Room ${roomId} now has ${Object.keys(roomData.users || {}).length} users`, 'RoomGateway');
      } catch (err) {
        const roomError = new RoomError(`Failed to join room ${roomId}`, {
          sessionId: sessionId,
          roomId,
          originalError: getErrorMessage(err),
        });
        Logger.error(roomError);
        await this.sessionService.destroySession(sessionId);
        socket.disconnect();
      }
    } catch (error) {
      const wsError = new WebSocketError('Session authentication failed', {
        roomId,
        clientIP: socket.handshake.address || 'unknown',
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
        const result = await roomEntity.join(sessionId, displayName);
        applicationMetrics.recordUserJoinedRoom(roomEntity.roomId);
        return result;
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

  async destroyConnection(socket: Socket, reason: string): Promise<void> {
    const sessionId = extractSessionIdFromSocket(socket);
    const roomId = getSocketRoomId(socket);

    if (!sessionId || !roomId) return;

    const roomEntity = new RoomEntity(roomId);

    const connectionMetadata = await this.sessionService.getConnectionMetadata(sessionId);
    if (!connectionMetadata || connectionMetadata.socketId !== socket.id) {
      Logger.log(`Session ${sessionId} reconnected to room ${roomId} due to ${reason}`);
      return;
    }

    await this.sessionService.destroySession(sessionId);

    try {
      const roomData = await roomEntity.leave(sessionId);
      applicationMetrics.recordUserLeftRoom(roomId);
      applicationMetrics.recordWebSocketDisconnection(reason, roomId);
      applicationMetrics.recordWebSocketDisconnected(roomId);
      broadcast(socket, RoomEvents.USER_DISCONNECT, {
        userId: sessionId,
        room: roomData,
      });
    } catch (err) {
      Logger.error(`Failed to leave room for session ${sessionId}:`, err);
    }

    Logger.log(`Session ${sessionId} disconnected from room ${roomId} due to ${reason}`, 'RoomGateway');
  }
}
