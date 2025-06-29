import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import SessionProvider from '../entities/Session';
import ConfigProvider from '../config/ConfigProvider';

@Injectable()
export class AutoSessionGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    return this.ensureSession(request, response);
  }

  private async ensureSession(request: any, response: any): Promise<boolean> {
    const sessionId = this.extractSessionFromRequest(request);
    
    if (sessionId) {
      // Try to get existing session
      try {
        const ipAddress = request.ip || request.connection?.remoteAddress;
        const session = await SessionProvider.get(sessionId, ipAddress);
        if (session) {
          request.session = session;
          return true;
        }
      } catch (error) {
        // Session doesn't exist or is invalid, create a new one
      }
    }

    // Create a new session
    const ipAddress = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];
    const newSession = await SessionProvider.create(ipAddress, userAgent);
    
    // Set the session cookie using Fastify's cookie API
    response.cookie('sessionId', newSession.sessionId, {
      httpOnly: true,
      secure: ConfigProvider.isProduction(),
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });
    
    request.session = newSession;
    return true;
  }

  private extractSessionFromRequest(request: any): string | null {
    // Check session cookie
    const sessionCookie = request.cookies?.sessionId;
    if (sessionCookie) {
      return sessionCookie;
    }

    // Check Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Query parameters removed for security - sessions should only come from cookies or headers

    return null;
  }
}