import { Injectable, Logger } from '@nestjs/common';
import { BaseWsThrottlerGuard } from './base-ws-throttler.guard';

@Injectable()
export class WsThrottlerGuard extends BaseWsThrottlerGuard {
  protected readonly logger = new Logger(WsThrottlerGuard.name);
}
