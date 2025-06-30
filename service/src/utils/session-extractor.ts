import { Request } from '../types/request';
import * as cookie from 'cookie';

export class SessionExtractor {
  static extractSessionId(request: Request): string | null {
    // Check session cookie first
    const sessionCookie = request.cookies?.sessionId;
    if (sessionCookie) {
      return sessionCookie;
    }

    // Check Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token.length > 0) {
        return token;
      }
    }

    return null;
  }

  static extractSessionIdFromSocket(socket: any): string | null {
    // Check handshake auth
    const auth = socket.handshake?.auth;
    if (auth?.sessionId) {
      return auth.sessionId;
    }

    // Check headers for Authorization
    const headers = socket.handshake?.headers;
    if (headers?.authorization && typeof headers.authorization === 'string') {
      const authHeader = headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        if (token.length > 0) {
          return token;
        }
      }
    }

    // Check cookies using secure cookie parser
    const cookieHeader = headers?.cookie;
    if (cookieHeader && typeof cookieHeader === 'string') {
      try {
        const cookies = cookie.parse(cookieHeader);
        if (cookies.sessionId) {
          return cookies.sessionId;
        }
      } catch (error) {
        // Invalid cookie format, continue to other methods
      }
    }

    return null;
  }
}