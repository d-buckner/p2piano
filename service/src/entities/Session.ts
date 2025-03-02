import { v4 as uuidv4 } from 'uuid';
import { SessionNotFoundError } from '../errors';
import Database from '../clients/Database';

export type Session = {
  sessionId: string,
  createdAt: Date,
};

const SessionCollection = Database.collection<Session>('session');
SessionCollection.createIndex({ sessionId: 1 });
// session ttl is 1 day
SessionCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });


export default class SessionProvider {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() { }

  static async create() {
    const sessionId = uuidv4();
    const session: Session = {
      sessionId,
      createdAt: new Date(),
    };
    await SessionCollection.insertOne({
      sessionId,
      createdAt: new Date(),
    });
    return session;
  }

  static async get(sessionId: string) {
    const session = await SessionCollection.findOne({ sessionId });
    if (!session) {
      throw new SessionNotFoundError(`Session ${sessionId} does not exist`);
    }

    return session;
  }
}
