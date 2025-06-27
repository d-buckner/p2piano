import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import SessionProvider from '../entities/Session';

@Injectable()
export class WsAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    
    try {
      const sessionId = this.extractSessionFromClient(client);
      
      if (!sessionId) {
        throw new WsException('Session required');
      }

      const ipAddress = this.getClientIP(client);
      const session = await SessionProvider.get(sessionId, ipAddress);
      if (!session) {
        throw new WsException('Invalid session');
      }

      // Attach session to client for later use
      client.session = session;
      return true;
    } catch (error) {
      client.disconnect();
      return false;
    }
  }

  private extractSessionFromClient(client: any): string | null {
    // Check handshake auth
    const auth = client.handshake?.auth;
    if (auth?.sessionId) {
      return auth.sessionId;
    }

    // Query parameters removed for security - sessions should only come from auth or headers

    // Check headers
    const headers = client.handshake?.headers;
    if (headers?.authorization) {
      const authHeader = headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
    }

    return null;
  }

  private getClientIP(client: any): string | undefined {
    return client.handshake?.address || 
           client.conn?.remoteAddress || 
           client.request?.connection?.remoteAddress;
  }
}