import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import RedisClient from '../clients/RedisClient';
import SessionProvider, { Session } from '../entities/Session';


interface ConnectionMetadata {
  socketId: string;
  registeredAt: string;
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
  async registerConnection(sessionId: string, socket: Socket, server: unknown): Promise<{ wasReconnection: boolean }> {
    // First, disconnect any existing connections for this session
    const existingConnection = await this.getConnectionMetadata(sessionId);
    const wasReconnection = !!existingConnection?.socketId;
    
    if (existingConnection?.socketId) {
      // Use Socket.IO's cross-server disconnect
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (server as any).of('/api').in(existingConnection.socketId).disconnectSockets(true);
    }

    // Now register the new connection
    const sessionKey = `session:${sessionId}`;
    await RedisClient.hSet(sessionKey, {
      socketId: socket.id,
      registeredAt: Date.now().toString(),
    });

    // Refresh TTL to 24 hours
    await RedisClient.expire(sessionKey, 86400);

    return { wasReconnection };
  }

  async getConnectionMetadata(sessionId: string): Promise<ConnectionMetadata | null> {
    const sessionKey = `session:${sessionId}`;
    const [socketId, registeredAt] = await RedisClient.hmGet(sessionKey, ['socketId', 'registeredAt']);

    if (!socketId) {
      return null;
    }

    return {
      socketId,
      registeredAt: registeredAt || Date.now().toString(),
    };
  }


  // Session cleanup
  async destroySession(sessionId: string): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    // Only remove connection metadata, keep session data intact
    await RedisClient.hDel(sessionKey, ['socketId', 'registeredAt']);
  }
}
