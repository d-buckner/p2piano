import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import type { TestingModule } from '@nestjs/testing';


describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return health status with timestamp and uptime', () => {
      const result = controller.health();

      expect(result).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });

      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return valid ISO timestamp', () => {
      const result = controller.health();
      const timestamp = new Date(result.timestamp);
      
      expect(timestamp.toISOString()).toBe(result.timestamp);
    });
  });

  describe('liveness', () => {
    it('should return ok status', () => {
      const result = controller.liveness();

      expect(result).toEqual({
        status: 'ok'
      });
    });
  });
});

