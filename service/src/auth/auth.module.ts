import { Module, Global } from '@nestjs/common';
import { SessionConfigService } from '../config/session-config.service';
import { SessionValidatorService } from '../services/session-validator.service';


@Global() // Make it global so it's available everywhere
@Module({
  providers: [SessionValidatorService, SessionConfigService],
  exports: [SessionValidatorService, SessionConfigService],
})
export class AuthModule {}
