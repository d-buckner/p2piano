import { Injectable, Logger, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(WsThrottlerGuard.name);

  protected async getTracker(context: ExecutionContext): Promise<string> {
    const wsContext = context.switchToWs();
    const client = wsContext.getClient();
    return client.conn.remoteAddress;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const wsContext = context.switchToWs();
    const client = wsContext.getClient();
    const eventName = wsContext.getData()?.event || context.getHandler().name;
    const ip = client.conn.remoteAddress;

    this.logger.warn(
      `🚫 WebSocket throttle limit exceeded for ${eventName} from ${ip}`,
    );

    // Instead of throwing an HTTP exception, return false for WebSocket
    return Promise.resolve();
  }
}
