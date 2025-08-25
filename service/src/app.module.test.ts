import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { WebsocketsModule } from './websockets/websockets.module';
import type { TestingModule } from '@nestjs/testing';


describe('AppModule', () => {
  let appModule: TestingModule;

  beforeEach(async () => {
    appModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(appModule).toBeDefined();
  });

  it('should have AppController', () => {
    const appController = appModule.get<AppController>(AppController);
    expect(appController).toBeDefined();
  });

  it('should have HealthController', () => {
    const healthController = appModule.get<HealthController>(HealthController);
    expect(healthController).toBeDefined();
  });

  it('should have AppService', () => {
    const appService = appModule.get<AppService>(AppService);
    expect(appService).toBeDefined();
  });

  it('should have AuthModule imported', () => {
    expect(appModule.get(AuthModule)).toBeDefined();
  });

  it('should have WebsocketsModule imported', () => {
    expect(appModule.get(WebsocketsModule)).toBeDefined();
  });

  it('should have ThrottlerModule configured', () => {
    const throttlerModule = appModule.get(ThrottlerModule);
    expect(throttlerModule).toBeDefined();
  });
});

