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
import { WsAuthGuard } from '../../auth/ws-auth.guard';
import {
  broadcast,
  defaultWebSocketGatewayOptions,
  getSocketMetadata,
  getSocketRoomId,
} from '../utils';
import { RoomEvents, SocketEvents } from './events';
import RoomEntity from '../../entities/Room';
import SessionProvider from '../../entities/Session';
import SessionRegistry from '../SessionRegistry';
import { UserUpdateDto } from '../../dto/ws/user-update.dto';
import { WsValidationPipe } from '../../pipes/ws-validation.pipe';

import type { Server, Socket } from 'socket.io';
import type { Session } from '../../entities/Session';

// Extend Socket to include session property
declare module 'socket.io' {
  interface Socket {
    session?: Session;
  }
}

@WebSocketGateway(defaultWebSocketGatewayOptions)
export class Room {
  @WebSocketServer()
  server: Server;

  constructor() {
    this.bootstrapConnection = this.bootstrapConnection.bind(this);
    this.destroyConnection = this.destroyConnection.bind(this);
  }

  @Throttle({ default: { limit: 10, ttl: 30 } })
  @UseGuards(WsAuthGuard, WsThrottlerGuard)
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
    this.server.on(SocketEvents.CONNECTION, this.bootstrapConnection);
  }

  onModuleDestroy() {
    this.server.off(SocketEvents.CONNECTION, this.bootstrapConnection);
  }

  async bootstrapConnection(socket: Socket) {
    const { displayName, roomId } = getSocketMetadata(socket);

    if (!roomId) {
      Logger.warn(`User denied connection due to missing roomId`);
      socket.disconnect();
      return;
    }

    // Authenticate the WebSocket connection using the same logic as WsAuthGuard
    try {
      const sessionId = this.extractSessionFromSocket(socket);
      if (!sessionId) {
        Logger.warn(`User denied connection - no sessionId found`);
        socket.disconnect();
        return;
      }

      const ipAddress = this.getClientIP(socket);
      const session = await SessionProvider.get(sessionId, ipAddress);
      if (!session) {
        Logger.warn(`User denied connection due to invalid session ${sessionId}`);
        socket.disconnect();
        return;
      }

      // Attach session to socket for later use
      socket.session = session;
      
      const prevSocket = SessionRegistry.getSocket(session.sessionId);
      SessionRegistry.registerSession(session.sessionId, socket);
      // Disconnect existing connection if exists
      prevSocket?.disconnect();

      const roomEntity = new RoomEntity(roomId);

      try {
        // Retry logic for race condition handling in the case the room was just created
        const roomData = await this.retryRoomJoin(roomEntity, session.sessionId, displayName as string, 5);

        socket.join(roomId);
        socket.on(SocketEvents.DISCONNECT, reason => this.destroyConnection(socket, reason));

        if (prevSocket) {
          // Client reconnect, no need to send connection events
          return;
        }

        broadcast(socket, RoomEvents.USER_CONNECT, {
          userId: session.sessionId,
          room: roomData,
        });

        socket.emit(RoomEvents.ROOM_JOIN, {
          userId: session.sessionId,
          room: roomData,
        });

        Logger.log(`Session ${session.sessionId} connected to room ${roomId}`);
      } catch (err) {
        console.error(err);
        SessionRegistry.destroySession(session.sessionId);
        socket.disconnect();
      }
    } catch (error) {
      Logger.warn(`User denied connection due to session error: ${error.message}`);
      socket.disconnect();
      return;
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

  private extractSessionFromSocket(socket: Socket): string | null {
    // Check handshake auth
    const auth = socket.handshake?.auth;
    if (auth?.sessionId) {
      return auth.sessionId;
    }

    // Check headers for Authorization
    const headers = socket.handshake?.headers;
    if (headers?.authorization) {
      const authHeader = headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
    }

    // Check cookies
    const cookies = this.parseCookies(headers?.cookie);
    if (cookies?.sessionId) {
      return cookies.sessionId;
    }

    return null;
  }

  private getClientIP(socket: Socket): string | undefined {
    return socket.handshake?.address || 
           socket.conn?.remoteAddress || 
           socket.request?.connection?.remoteAddress;
  }

  private parseCookies(cookieHeader: string): Record<string, string> | null {
    if (!cookieHeader) return null;
    
    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    
    return cookies;
  }
}
