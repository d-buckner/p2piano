import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  async handleRequest(context: ExecutionContext, limit: number, ttl: number): Promise<boolean> {
    const wsContext = context.switchToWs();
    const client = wsContext.getClient();
    const ip = client.conn.remoteAddress;
    const eventName = wsContext.getData()?.event || context.getHandler().name;
    const key = this.generateKey(context, ip);
    const { totalHits } = await this.storageService.increment(key, ttl);

    Logger.debug(`🔍 ${eventName}: ${totalHits}/${limit} for ${ip} (TTL: ${ttl}ms)`);

    if (totalHits > limit) {
      Logger.warn(`🚫 WebSocket throttle limit exceeded: ${totalHits}/${limit} for ${eventName} from ${ip}`);
      return false;
    }

    return true;
  }
}
