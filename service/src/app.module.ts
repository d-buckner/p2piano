import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketsModule } from './websockets/websockets.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute per IP
      },
      {
        name: 'strict',
        ttl: 60000, // 1 minute  
        limit: 60, // 60 requests per minute per IP for sensitive endpoints
      }
    ]),
    WebsocketsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    AppService,
  ],
})
export class AppModule { }
