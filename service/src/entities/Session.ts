import RedisClient from '../clients/RedisClient';
import ConfigProvider from '../config/ConfigProvider';
import { SessionNotFoundError } from '../errors';


export type Session = {
  sessionId: string,
  createdAt: Date,
  lastActivity: Date,
  ipAddress?: string,
  userAgent?: string,
};


export default class SessionProvider {
   
  private constructor() { }

  static async create(ipAddress?: string, userAgent?: string): Promise<Session> {
    const sessionId = crypto.randomUUID();
    const now = new Date();
    const session: Session = {
      sessionId,
      createdAt: now,
      lastActivity: now,
      ipAddress,
      userAgent,
    };

    const sessionKey = `session:${sessionId}`;
    const sessionData = JSON.stringify(session);

    await RedisClient.hSet(sessionKey, 'data', sessionData);
    await RedisClient.expire(sessionKey, 86400); // 24 hours TTL

    return session;
  }

  static async get(sessionId: string, ipAddress?: string): Promise<Session> {
    const sessionKey = `session:${sessionId}`;
    const sessionData = await RedisClient.hGet(sessionKey, 'data');

    if (!sessionData) {
      throw new SessionNotFoundError(`Session ${sessionId} does not exist`);
    }

    const session: Session = JSON.parse(sessionData);
    
    // Convert string dates back to Date objects
    session.createdAt = new Date(session.createdAt);
    session.lastActivity = new Date(session.lastActivity);

    // Validate IP address if provided and stored (only in production)
    if (ipAddress && session.ipAddress && session.ipAddress !== ipAddress && ConfigProvider.isProduction()) {
      throw new SessionNotFoundError(`Session ${sessionId} IP mismatch`);
    }

    // Update last activity
    const now = new Date();
    session.lastActivity = now;
    const updatedSessionData = JSON.stringify(session);
    
    await RedisClient.hSet(sessionKey, 'data', updatedSessionData);
    await RedisClient.expire(sessionKey, 86400); // Reset TTL

    return session;
  }
}
