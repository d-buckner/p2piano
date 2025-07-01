import { Injectable, Logger, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export abstract class BaseWsThrottlerGuard extends ThrottlerGuard {
  protected abstract readonly logger: Logger;

  protected async getTracker(context: ExecutionContext): Promise<string> {
    if (context.getType() !== 'ws') {
      return super.getTracker(context);
    }

    const client = context.switchToWs().getClient();
    return this.getClientIdentifier(client);
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    if (context.getType() !== 'ws') {
      return super.throwThrottlingException(context, throttlerLimitDetail);
    }

    const client = context.switchToWs().getClient();
    const eventName = context.getHandler().name;
    const clientId = this.getClientIdentifier(client);

    this.logger.warn(
      `🚫 WebSocket throttle limit exceeded for ${eventName} from ${clientId}`,
    );

    client.emit('exception', this.buildErrorResponse(context, throttlerLimitDetail));
    return Promise.resolve();
  }

  protected getClientIdentifier(client: any): string {
    return client.handshake?.address || client.id || 'unknown';
  }

  protected buildErrorResponse(context: ExecutionContext, throttlerLimitDetail: ThrottlerLimitDetail) {
    return {
      status: 'error',
      code: 429,
      message: 'Rate limit exceeded. Please slow down your requests.',
      event: context.getHandler().name,
      timestamp: new Date().toISOString(),
    };
  }
}