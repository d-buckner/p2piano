import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { RoomEvents } from 'src/websockets/room/events';
import RedisClient from '../clients/RedisClient';
import SessionProvider, { Session } from '../entities/Session';
import type { Server } from 'socket.io';


interface ConnectionMetadata {
  socketId: string;
  registeredAt: string;
}

interface RegisterConnectionResult {
  isReconnection: boolean
}

@Injectable()
export class SessionService {

  // Session data management
  async getSession(sessionId: string, ipAddress?: string): Promise<Session | null> {
    return SessionProvider.get(sessionId, ipAddress);
  }

  async createSession(ipAddress?: string, userAgent?: string): Promise<Session> {
    return SessionProvider.create(ipAddress, userAgent);
  }


  // WebSocket connection tracking
  async registerConnection(sessionId: string, socket: Socket, server: Server): Promise<RegisterConnectionResult> {
    // First, disconnect any existing connections for this session
    const existingConnection = await this.getConnectionMetadata(sessionId);
    const isReconnection = !!existingConnection?.socketId;
    
    if (isReconnection) {
      const operator = server.in(existingConnection.socketId);
      // notify prior connection that it's being dropped in favor of a newer one
      // this happens when staring/creating a room in a 2nd window/tab
      operator.emit(RoomEvents.NEWER_CONNECTION);
      operator.disconnectSockets(true);
    }

    // Now register the new connection
    const sessionKey = `session:${sessionId}`;
    await RedisClient.hSet(sessionKey, {
      socketId: socket.id,
      registeredAt: Date.now().toString(),
    });

    // Refresh TTL to 24 hours
    await RedisClient.expire(sessionKey, 86400);

    return { isReconnection };
  }

  async getConnectionMetadata(sessionId: string): Promise<ConnectionMetadata | null> {
    const sessionKey = `session:${sessionId}`;
    const [socketId, registeredAt] = await RedisClient.hmGet(sessionKey, ['socketId', 'registeredAt']);

    if (!socketId || !registeredAt) {
      return null;
    }

    return {
      socketId,
      registeredAt,
    };
  }


  // Session cleanup
  async destroySession(sessionId: string): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    // Only remove connection metadata, keep session data intact
    await RedisClient.hDel(sessionKey, ['socketId', 'registeredAt']);
  }
}
