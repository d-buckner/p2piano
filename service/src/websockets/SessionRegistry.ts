import { nanoid } from 'nanoid';
import RedisClient from '../clients/RedisClient';
import type { Socket } from 'socket.io';


interface SocketMetadata {
  socketId: string,
  serverId: string,
}


export default class SessionRegistry {
   
  private constructor() { }
  private static serverId = nanoid();

  static async registerSession(sessionId: string, socket: Socket): Promise<void> {
    // Store session-to-socket mapping in Redis only
    const sessionKey = `session:${sessionId}`;
    await RedisClient.hSet(sessionKey, {
      serverId: SessionRegistry.serverId,
      socketId: socket.id,
      registeredAt: Date.now().toString()
    });
    
    // Set TTL to prevent stale entries (sessions expire in 24 hours anyway)
    await RedisClient.expire(sessionKey, 86400);
  }

  static async getSocketMetadata(sessionId: string): Promise<SocketMetadata | null> {
    // Get session info from Redis
    const sessionKey = `session:${sessionId}`;
    const sessionInfo = await RedisClient.hGetAll(sessionKey);
    
    if (!sessionInfo.serverId || !sessionInfo.socketId) {
      return null;
    }
    
    return {
      serverId: sessionInfo.serverId,
      socketId: sessionInfo.socketId
    };
  }

  static async destroySession(sessionId: string): Promise<void> {
    // Remove from Redis
    const sessionKey = `session:${sessionId}`;
    await RedisClient.del(sessionKey);
  }

  static getServerId(): string {
    return SessionRegistry.serverId;
  }

  static async isLocalSession(sessionId: string): Promise<boolean> {
    const socketMetadata = await SessionRegistry.getSocketMetadata(sessionId);
    return socketMetadata?.serverId === SessionRegistry.serverId;
  }
}
