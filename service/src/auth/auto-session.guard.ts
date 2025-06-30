import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Reply } from '../types/request';
import SessionProvider from '../entities/Session';
import ConfigProvider from '../config/ConfigProvider';
import { SessionExtractor } from '../utils/session-extractor';

@Injectable()
export class AutoSessionGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    return this.ensureSession(request, response);
  }

  private async ensureSession(request: Request, response: Reply): Promise<boolean> {
    const sessionId = SessionExtractor.extractSessionId(request);
    
    if (sessionId) {
      // Try to get existing session
      try {
        const session = await SessionProvider.get(sessionId, request.ip);
        if (session) {
          request.session = session;
          return true;
        }
      } catch (error) {
        // Session doesn't exist or is invalid, create a new one
      }
    }

    // Create a new session
    const userAgent = request.headers['user-agent'];
    const newSession = await SessionProvider.create(request.ip, userAgent);
    
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

}