import { Module, Global } from '@nestjs/common';
import { SessionValidatorService } from '../services/session-validator.service';
import { SessionConfigService } from '../config/session-config.service';

@Global() // Make it global so it's available everywhere
@Module({
  providers: [SessionValidatorService, SessionConfigService],
  exports: [SessionValidatorService, SessionConfigService],
})
export class AuthModule {}