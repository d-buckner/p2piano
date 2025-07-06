import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { WebsocketsModule } from './websockets/websockets.module';


@Module({
  imports: [
    AuthModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 500, // 500 requests per minute per session - generous for normal app usage
      },
      {
        name: 'strict',
        ttl: 60000, // 1 minute  
        limit: 200, // 200 requests per minute per session for sensitive endpoints
      }
    ]),
    WebsocketsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
  ],
})
export class AppModule { }
