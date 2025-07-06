import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
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
export class SignalThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(SignalThrottlerGuard.name);

  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, limit, ttl, throttler, blockDuration, generateKey } = requestProps;
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const tracker = client.session?.ipAddress || client.id;
    if (!tracker) {
      throw new Error('Client identifier is required for throttling');
    }
    const throttlerName = throttler.name ?? 'default';
    const key = generateKey(context, tracker, throttlerName);
    
    const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } = 
      await this.storageService.increment(key, ttl, limit, blockDuration, throttlerName);
    
    if (isBlocked) {
      this.throwThrottlingException(context, {
        limit, ttl, key, tracker, totalHits, timeToExpire, isBlocked, timeToBlockExpire,
      });
      return false;
    }
    
    return true;
  }

  protected async throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: ThrottlerLimitDetail): Promise<void> {
    const client = context.switchToWs().getClient();
    const eventName = context.getHandler().name;
    const ip = throttlerLimitDetail.tracker;

    this.logger.warn(
      `🚫 Signal throttle limit exceeded for ${eventName} from ${ip}`,
    );

    client.emit('exception', {
      status: 'error',
      code: 429,
      message: 'Signal rate limit exceeded. Please slow down.',
      event: eventName,
      timestamp: new Date().toISOString(),
    });
  }
}
