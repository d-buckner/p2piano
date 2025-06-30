import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from '../types/request';
import SessionProvider from '../entities/Session';
import { SessionExtractor } from '../utils/session-extractor';
import { AuthenticationError } from '../errors';

/**
 * Authentication guard that validates user sessions for HTTP requests.
 * 
 * Extracts session ID from Authorization header (Bearer token) or cookies,
 * validates the session exists and is valid, then attaches it to the request.
 * 
 * @example
 * ```typescript
 * @UseGuards(AuthGuard)
 * @Get('/protected')
 * async protectedRoute(@Req() request: Request) {
 *   // request.session is now available
 *   return { userId: request.session.sessionId };
 * }
 * ```
 */
@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * Determines if the current request is authorized by validating the session.
   * 
   * @param context - The execution context containing the HTTP request
   * @returns Promise resolving to true if authorized
   * @throws UnauthorizedException if session is invalid or missing
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateSession(request);
  }

  /**
   * Validates the user session and attaches it to the request.
   * 
   * @param request - The HTTP request object
   * @returns Promise resolving to true if session is valid
   * @throws UnauthorizedException if session validation fails
   */
  private async validateSession(request: Request): Promise<boolean> {
    const sessionId = SessionExtractor.extractSessionId(request);
    
    if (!sessionId) {
      throw new UnauthorizedException('Session required');
    }

    try {
      const session = await SessionProvider.get(sessionId, request.ip);
      if (!session) {
        throw new AuthenticationError('Invalid session', { sessionId, ip: request.ip });
      }
      
      // Attach session to request for later use
      request.session = session;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new AuthenticationError('Session validation failed', { 
        sessionId, 
        ip: request.ip,
        originalError: error.message 
      });
    }
  }

}