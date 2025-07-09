import { Module, Global } from '@nestjs/common';
import { SessionConfigService } from '../config/session-config.service';
import { SessionValidatorService } from '../services/session-validator.service';
import { SessionService } from '../services/session.service';


@Global() // Make it global so it's available everywhere
@Module({
  providers: [SessionService, SessionValidatorService, SessionConfigService],
  exports: [SessionService, SessionValidatorService, SessionConfigService],
})
export class AuthModule {}
