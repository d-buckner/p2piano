import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class SignalThrottlerGuard extends ThrottlerGuard {
  private readonly WEBRTC_LIMITS = {
    'ice-candidate': { limit: 600, ttl: 60000, burst: 100, burstTtl: 10000 },
    'offer': { limit: 120, ttl: 60000, burst: 20, burstTtl: 10000 },
    'answer': { limit: 120, ttl: 60000, burst: 20, burstTtl: 10000 },
    'default': { limit: 60, ttl: 60000, burst: 10, burstTtl: 10000 }
  };

  async handleRequest(context: ExecutionContext): Promise<boolean> {
    const wsContext = context.switchToWs();
    const client = wsContext.getClient();
    const ip = client.conn.remoteAddress;
    const data = wsContext.getData();
    const signalType = data?.signalData?.type || 'default';
    const config = this.WEBRTC_LIMITS[signalType] || this.WEBRTC_LIMITS.default;

    // Check burst limit first
    const burstKey = this.generateKey(context, `${ip}:${signalType}:burst`);
    const { totalHits: burstHits } = await this.storageService.increment(burstKey, config.burstTtl);

    Logger.debug(`🔍 ${signalType} burst: ${burstHits}/${config.burst} for ${ip}`);

    if (burstHits > config.burst) {
      Logger.warn(`🚫 Signal BURST limit exceeded: ${burstHits}/${config.burst} for ${signalType} from ${ip}`);
      return false;
    }

    // Check main limit
    const mainKey = this.generateKey(context, `${ip}:${signalType}:main`);
    const { totalHits: mainHits } = await this.storageService.increment(mainKey, config.ttl);

    Logger.debug(`🔍 ${signalType} main: ${mainHits}/${config.limit} for ${ip}`);

    if (mainHits > config.limit) {
      Logger.warn(`🚫 Signal MAIN limit exceeded: ${mainHits}/${config.limit} for ${signalType} from ${ip}`);
      return false;
    }

    return true;
  }

  protected generateKey(context: ExecutionContext, suffix: string): string {
    return `signal-${context.getClass().name}-${context.getHandler().name}-${suffix}`;
  }
}
