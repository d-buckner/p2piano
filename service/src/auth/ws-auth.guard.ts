import { Injectable } from '@nestjs/common';
import type { SessionValidatorService } from '../services/session-validator.service';
import type { AuthenticatedSocket } from '../types/socket';
import type { CanActivate, ExecutionContext } from '@nestjs/common';


@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly sessionValidator: SessionValidatorService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    
    if (!client) {
      return false;
    }
    
    try {
      const isValid = await this.sessionValidator.validateAndAttachToSocket(client);
      
      if (!isValid) {
        client.disconnect();
        return false;
      }

      return true;
    } catch (error) {
      client?.disconnect();
      return false;
    }
  }
}
