import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SignalThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(SignalThrottlerGuard.name);

  private readonly WEBRTC_LIMITS = {
    'ice-candidate': { limit: 600, ttl: 60000, burst: 100, burstTtl: 10000 },
    'offer': { limit: 120, ttl: 60000, burst: 20, burstTtl: 10000 },
    'answer': { limit: 120, ttl: 60000, burst: 20, burstTtl: 10000 },
    'default': { limit: 60, ttl: 60000, burst: 10, burstTtl: 10000 }
  };

  constructor(
    protected readonly throttlerModuleOptions: ThrottlerModuleOptions,
    protected readonly storageService: ThrottlerStorage,
    protected readonly reflector: Reflector,
  ) {
    super(throttlerModuleOptions, storageService, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const wsContext = context.switchToWs();
    const client = wsContext.getClient();
    const ip = client.conn.remoteAddress;
    const data = wsContext.getData();
    const signalType = data?.signalData?.type || 'default';
    const config = this.WEBRTC_LIMITS[signalType] || this.WEBRTC_LIMITS.default;

    // Check burst limit
    const burstResult = await this.checkLimit(
      context,
      ip,
      `${signalType}:burst`,
      config.burst,
      config.burstTtl,
    );

    if (!burstResult) {
      this.logger.warn(
        `🚫 Signal BURST limit exceeded for ${signalType} from ${ip}`,
      );
      return false;
    }

    // Check main limit
    const mainResult = await this.checkLimit(
      context,
      ip,
      `${signalType}:main`,
      config.limit,
      config.ttl,
    );

    if (!mainResult) {
      this.logger.warn(
        `🚫 Signal MAIN limit exceeded for ${signalType} from ${ip}`,
      );
      return false;
    }

    return true;
  }

  private async checkLimit(
    context: ExecutionContext,
    ip: string,
    type: string,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const key = `signal:${context.getClass().name}:${context.getHandler().name}:${ip}:${type}`;

    const { totalHits, timeToExpire } = await this.storageService.increment(
      key,
      ttl,
      limit,
      0,
      type,
    );

    this.logger.debug(
      `🔍 ${type}: ${totalHits}/${limit} for ${ip} (expires in: ${timeToExpire}ms)`,
    );

    return totalHits <= limit;
  }

  protected async getTracker(context: ExecutionContext): Promise<string> {
    const wsContext = context.switchToWs();
    const client = wsContext.getClient();
    const data = wsContext.getData();
    const signalType = data?.signalData?.type || 'default';
    return `${client.conn.remoteAddress}:${signalType}`;
  }
}
