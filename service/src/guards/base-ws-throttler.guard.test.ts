import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { applicationMetrics } from '../telemetry/metrics';
import { BaseWsThrottlerGuard } from './base-ws-throttler.guard';
import type { ExecutionContext} from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';

// Mock the metrics module
vi.mock('../telemetry/metrics', () => ({
  applicationMetrics: {
    recordRateLimitViolation: vi.fn(),
  },
}));

// Concrete implementation for testing the abstract class
class TestWsThrottlerGuard extends BaseWsThrottlerGuard {
  protected readonly logger = new Logger(TestWsThrottlerGuard.name);
}

describe('BaseWsThrottlerGuard', () => {
  let guard: TestWsThrottlerGuard;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{
          name: 'default',
          ttl: 60000,
          limit: 500,
        }]),
      ],
      providers: [TestWsThrottlerGuard],
    }).compile();

    guard = module.get<TestWsThrottlerGuard>(TestWsThrottlerGuard);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getTracker', () => {
    it('should return client identifier from WebSocket context', async () => {
      const mockSocket = {
        id: 'test-socket-id',
        handshake: { address: '127.0.0.1' }
      };

      const mockContext = {
        switchToWs: vi.fn().mockReturnValue({
          getClient: vi.fn().mockReturnValue(mockSocket)
        })
      } as any as ExecutionContext;

      const result = await guard['getTracker'](mockContext);

      expect(result).toBe('127.0.0.1');
      expect(mockContext.switchToWs).toHaveBeenCalled();
    });
  });

  describe('getClientIdentifier', () => {
    it('should return handshake address if available', () => {
      const client = {
        id: 'test-id',
        handshake: { address: '127.0.0.1' }
      } as any;

      const result = guard['getClientIdentifier'](client);
      expect(result).toBe('127.0.0.1');
    });

    it('should return socket id if no handshake address', () => {
      const client = {
        id: 'test-id',
        handshake: {}
      } as any;

      const result = guard['getClientIdentifier'](client);
      expect(result).toBe('test-id');
    });

    it('should return unknown if no address or id', () => {
      const client = {} as any;

      const result = guard['getClientIdentifier'](client);
      expect(result).toBe('unknown');
    });
  });

  describe('buildErrorResponse', () => {
    it('should build proper error response with handler name', () => {
      const mockContext = {
        getHandler: vi.fn().mockReturnValue({ name: 'testEvent' })
      } as any as ExecutionContext;

      const result = guard['buildErrorResponse'](mockContext);

      expect(result).toMatchObject({
        status: 'error',
        code: 429,
        message: 'Rate limit exceeded. Please slow down your requests.',
        event: 'testEvent',
        timestamp: expect.any(String)
      });

      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('throwThrottlingException', () => {
    it('should emit exception and record metrics', async () => {
      const mockSocket = {
        id: 'test-socket-id',
        handshake: { address: '127.0.0.1' },
        emit: vi.fn()
      };

      const mockContext = {
        switchToWs: vi.fn().mockReturnValue({
          getClient: vi.fn().mockReturnValue(mockSocket)
        }),
        getHandler: vi.fn().mockReturnValue({ name: 'testEvent' })
      } as any as ExecutionContext;

      const loggerSpy = vi.spyOn(guard['logger'], 'warn').mockImplementation(() => {});

      await guard['throwThrottlingException'](mockContext);

      expect(applicationMetrics.recordRateLimitViolation).toHaveBeenCalledWith(
        'websocket:testEvent',
        '127.0.0.1'
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('exception', expect.any(Object));
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('WebSocket throttle limit exceeded')
      );

      loggerSpy.mockRestore();
    });
  });
});

