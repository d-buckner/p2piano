import type { Socket } from 'socket.io';


export default class SessionRegistry {
   
  private constructor() { }
  private static registry = new Map<string, Socket>();

  static registerSession(sessionId: string, socket: Socket) {
    SessionRegistry.registry.set(sessionId, socket);
  }

  static getSocket(sessionId: string): Socket | undefined {
    return SessionRegistry.registry.get(sessionId);
  }

  static destroySession(sessionId: string) {
    SessionRegistry.registry.delete(sessionId);
  }
}
