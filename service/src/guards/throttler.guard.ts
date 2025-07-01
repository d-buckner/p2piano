import { Injectable, Logger, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(WsThrottlerGuard.name);

  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, limit, ttl, throttler, blockDuration, generateKey } = requestProps;
    const client = context.switchToWs().getClient();
    const tracker = client.conn?.remoteAddress || client._socket?.remoteAddress || client.id;
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

  protected async throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: any): Promise<void> {
    const client = context.switchToWs().getClient();
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
