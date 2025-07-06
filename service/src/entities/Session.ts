import Database from '../clients/Database';
import ConfigProvider from '../config/ConfigProvider';
import { SessionNotFoundError } from '../errors';


export type Session = {
  sessionId: string,
  createdAt: Date,
  lastActivity: Date,
  ipAddress?: string,
  userAgent?: string,
};

const SessionCollection = Database.collection<Session>('session');
SessionCollection.createIndex({ sessionId: 1 });
// session ttl is 1 day
SessionCollection.createIndex({ lastActivity: 1 }, { expireAfterSeconds: 86400 });


export default class SessionProvider {
   
  private constructor() { }

  static async create(ipAddress?: string, userAgent?: string) {
    const sessionId = crypto.randomUUID();
    const now = new Date();
    const session: Session = {
      sessionId,
      createdAt: now,
      lastActivity: now,
      ipAddress,
      userAgent,
    };
    await SessionCollection.insertOne(session);
    return session;
  }

  static async get(sessionId: string, ipAddress?: string) {
    const session = await SessionCollection.findOne({ sessionId });
    if (!session) {
      throw new SessionNotFoundError(`Session ${sessionId} does not exist`);
    }

    // Validate IP address if provided and stored (only in production)
    if (ipAddress && session.ipAddress && session.ipAddress !== ipAddress && ConfigProvider.isProduction()) {
      throw new SessionNotFoundError(`Session ${sessionId} IP mismatch`);
    }

    // Update last activity
    await SessionCollection.updateOne(
      { sessionId },
      { $set: { lastActivity: new Date() } }
    );

    return session;
  }
}
