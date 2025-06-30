import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import SessionProvider from '../entities/Session';
import { SessionExtractor } from '../utils/session-extractor';

@Injectable()
export class WsAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    
    try {
      const sessionId = SessionExtractor.extractSessionIdFromSocket(client);
      
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


  private getClientIP(client: Socket): string | undefined {
    return client.handshake?.address || 
           client.conn?.remoteAddress;
  }
}