import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { applicationMetrics } from '../telemetry/metrics';
import { extractSessionIdFromSocket } from '../websockets/utils';
import type { ExecutionContext } from '@nestjs/common';
import type { ThrottlerRequest } from '@nestjs/throttler';
import type { Socket } from 'socket.io';


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
    const client = context.switchToWs().getClient<Socket>();
    
    const tracker = extractSessionIdFromSocket(client);
    if (!tracker) {
      throw new Error('Socket session ID is required for throttling');
    }
    
    const throttlerName = throttler.name ?? 'default';
    const key = generateKey(context, tracker, throttlerName);
    
    const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } = 
      await this.storageService.increment(key, ttl, limit, blockDuration, throttlerName);
    
    if (isBlocked) {
      await this.throwThrottlingException(context, {
        limit, ttl, key, tracker, totalHits, timeToExpire, isBlocked, timeToBlockExpire,
      });
      return false; // This should prevent handler execution
    }
    
    return true;
  }

  protected async throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: ThrottlerLimitDetail): Promise<void> {
    const client = context.switchToWs().getClient<Socket>();
    const eventName = context.getHandler().name;
    const ip = throttlerLimitDetail.tracker;
    const sessionId = extractSessionIdFromSocket(client);

    // Record rate limit violation metric
    applicationMetrics.recordRateLimitViolation(`websocket:${eventName}`, sessionId || ip);

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
