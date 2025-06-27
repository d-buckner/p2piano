import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import SessionProvider from '../entities/Session';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateSession(request);
  }

  private async validateSession(request: any): Promise<boolean> {
    const sessionId = this.extractSessionFromRequest(request);
    
    if (!sessionId) {
      throw new UnauthorizedException('Session required');
    }

    try {
      const ipAddress = request.ip || request.connection?.remoteAddress;
      const session = await SessionProvider.get(sessionId, ipAddress);
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

  private extractSessionFromRequest(request: any): string | null {
    // Check Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check session cookie
    const sessionCookie = request.cookies?.sessionId;
    if (sessionCookie) {
      return sessionCookie;
    }

    // Query parameters removed for security - sessions should only come from cookies or headers

    return null;
  }
}