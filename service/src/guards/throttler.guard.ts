import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { getSocketSessionId } from '../websockets/utils';
import type { AuthenticatedSocket } from '../types/socket';
import type { ExecutionContext } from '@nestjs/common';
import type { ThrottlerRequest } from '@nestjs/throttler';


interface ThrottlerLimitDetail {
  tracker: string;
  limit?: number;
  ttl?: number;
  key?: string;
  totalHits?: number;
  timeToExpire?: number;
  isBlocked?: boolean;
  timeToBlockExpire?: number;
}


@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(WsThrottlerGuard.name);

  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, limit, ttl, throttler, blockDuration, generateKey } = requestProps;
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    
    // Use a combination of IP and session id from session object
    // This helps distinguish between multiple users on the same network
    const ip = client.session.ipAddress || 'unknown';
    const sessionId = getSocketSessionId(client);
    const tracker = `${ip}:${sessionId}`;
    
    const key = generateKey(context, tracker, throttler.name);
    
    const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } = 
      await this.storageService.increment(key, ttl, limit, blockDuration, throttler.name);
    
    if (isBlocked) {
      await this.throwThrottlingException(context, {
        limit, ttl, key, tracker, totalHits, timeToExpire, isBlocked, timeToBlockExpire,
      });
      return false; // This should prevent handler execution
    }
    
    return true;
  }

  protected async throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: ThrottlerLimitDetail): Promise<void> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const eventName = context.getHandler().name;
    const ip = throttlerLimitDetail.tracker;

    this.logger.warn(
      `🚫 WebSocket throttle limit exceeded for ${eventName} from ${ip}`,
    );

    // Emit 429 exception to the client
    client.emit('exception', {
      status: 'error',
      code: 429,
      message: 'Rate limit exceeded. Please slow down your requests.',
      event: eventName,
      timestamp: new Date().toISOString(),
    });

    return Promise.resolve();
  }
}
