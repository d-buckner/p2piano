import { Injectable } from '@nestjs/common';
import { SessionValidatorService } from '../services/session-validator.service';
import type { Request, Reply } from '../types/request';
import type { CanActivate, ExecutionContext } from '@nestjs/common';


@Injectable()
export class AutoSessionGuard implements CanActivate {
  constructor(private readonly sessionValidator: SessionValidatorService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const reply = context.switchToHttp().getResponse<Reply>();
      
      if (!request || !reply) {
        return false;
      }
      
      await this.sessionValidator.getOrCreateSession(request, reply);
      return true;
    } catch (error) {
      return false;
    }
  }
}
