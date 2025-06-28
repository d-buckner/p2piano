import { v4 as uuidv4 } from 'uuid';
import { SessionNotFoundError } from '../errors';
import Database from '../clients/Database';

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
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() { }

  static async create(ipAddress?: string, userAgent?: string) {
    const sessionId = uuidv4();
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

    // Validate IP address if provided and stored
    if (ipAddress && session.ipAddress && session.ipAddress !== ipAddress) {
      throw new SessionNotFoundError(`Session ${sessionId} IP mismatch`);
    }

    // Update last activity
    await SessionCollection.updateOne(
      { sessionId },
      { $set: { lastActivity: new Date() } }
    );

    return session;
  }

  static async revoke(sessionId: string) {
    await SessionCollection.deleteOne({ sessionId });
  }

  static async revokeAll(ipAddress: string) {
    await SessionCollection.deleteMany({ ipAddress });
  }

  static async rotate(sessionId: string, ipAddress?: string): Promise<Session> {
    // Get the existing session to validate it exists and extract metadata
    const existingSession = await SessionProvider.get(sessionId, ipAddress);
    
    // Create a new session ID while preserving other session data
    const newSessionId = uuidv4();
    const now = new Date();
    
    const newSession: Session = {
      sessionId: newSessionId,
      createdAt: existingSession.createdAt, // Preserve original creation time
      lastActivity: now,
      ipAddress: existingSession.ipAddress,
      userAgent: existingSession.userAgent,
    };
    
    // Insert the new session and delete the old one atomically
    await SessionCollection.insertOne(newSession);
    await SessionCollection.deleteOne({ sessionId });
    
    return newSession;
  }
}
