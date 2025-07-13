import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { applicationMetrics } from '../telemetry/metrics';
import type { Logger, ExecutionContext } from '@nestjs/common';
import type { Socket } from 'socket.io';


@Injectable()
export abstract class BaseWsThrottlerGuard extends ThrottlerGuard {
  protected abstract readonly logger: Logger;

  protected async getTracker(context: ExecutionContext): Promise<string> {
    const client = context.switchToWs().getClient();
    return this.getClientIdentifier(client);
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const client = context.switchToWs().getClient();
    const eventName = context.getHandler().name;
    const clientId = this.getClientIdentifier(client);

    // Record rate limit violation metric
    applicationMetrics.recordRateLimitViolation(`websocket:${eventName}`, clientId);

    this.logger.warn(
      `🚫 WebSocket throttle limit exceeded for ${eventName} from ${clientId}`,
    );

    client.emit('exception', this.buildErrorResponse(context));
    return Promise.resolve();
  }

  protected getClientIdentifier(client: Socket): string {
    return client.handshake?.address || client.id || 'unknown';
  }

  protected buildErrorResponse(context: ExecutionContext) {
    return {
      status: 'error',
      code: 429,
      message: 'Rate limit exceeded. Please slow down your requests.',
      event: context.getHandler().name,
      timestamp: new Date().toISOString(),
    };
  }
}
