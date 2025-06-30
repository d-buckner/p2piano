import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from '../types/request';
import SessionProvider from '../entities/Session';
import { SessionExtractor } from '../utils/session-extractor';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateSession(request);
  }

  private async validateSession(request: Request): Promise<boolean> {
    const sessionId = SessionExtractor.extractSessionId(request);
    
    if (!sessionId) {
      throw new UnauthorizedException('Session required');
    }

    try {
      const session = await SessionProvider.get(sessionId, request.ip);
      if (!session) {
        throw new UnauthorizedException('Invalid session');
      }
      
      // Attach session to request for later use
      request.session = session;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid session');
    }
  }

}