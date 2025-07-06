import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { SessionValidatorService } from '../services/session-validator.service';
import type { Request } from '../types/request';
import type { CanActivate, ExecutionContext} from '@nestjs/common';

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
  constructor(private readonly sessionValidator: SessionValidatorService) {}

  /**
   * Determines if the current request is authorized by validating the session.
   * 
   * @param context - The execution context containing the HTTP request
   * @returns Promise resolving to true if authorized
   * @throws UnauthorizedException if session is invalid or missing
   */
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    try {
      const isValid = await this.sessionValidator.validateAndAttachToRequest(request);
      
      if (!isValid) {
        throw new UnauthorizedException('Session required');
      }
      
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Session required');
    }
  }
}
