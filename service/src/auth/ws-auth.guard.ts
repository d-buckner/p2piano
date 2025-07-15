import { Injectable } from '@nestjs/common';
import type { SessionValidatorService } from '../services/session-validator.service';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Socket } from 'socket.io';


@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly sessionValidator: SessionValidatorService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    
    if (!client) {
      return false;
    }
    
    try {
      const isValid = await this.sessionValidator.isValidSocket(client);
      
      if (!isValid) {
        client.disconnect();
        return false;
      }

      return true;
    } catch {
      client?.disconnect();
      return false;
    }
  }
}
