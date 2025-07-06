import { Test } from '@nestjs/testing';
import { vi } from 'vitest';
import { SessionValidatorService } from '../services/session-validator.service';
import { 
  createMockWsExecutionContext,
  createUUID
} from '../test-utils/validation.helpers';
import { WsAuthGuard } from './ws-auth.guard';
import type { ExecutionContext } from '@nestjs/common';


describe('WsAuthGuard', () => {
  let guard: WsAuthGuard;
  let sessionValidatorService: any;

  beforeEach(async () => {
    // Create mock session validator service
    sessionValidatorService = {
      validateAndAttachToSocket: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: WsAuthGuard,
          useFactory: () => new WsAuthGuard(sessionValidatorService),
        },
        {
          provide: SessionValidatorService,
          useValue: sessionValidatorService,
        },
      ],
    }).compile();

    guard = module.get<WsAuthGuard>(WsAuthGuard);

    vi.clearAllMocks();
  });

  describe('Session Validation', () => {
    it('should allow connection when session validation succeeds', async () => {
      const sessionId = createUUID();
      const mockExecutionContext = createMockWsExecutionContext({
        handshake: {
          auth: { sessionId },
          query: { roomId: 'test-room' },
          headers: {},
          time: new Date().toISOString(),
          address: '192.168.1.1',
          xdomain: false,
          secure: false,
          issued: Date.now(),
          url: '/socket.io/'
        }
      });

      sessionValidatorService.validateAndAttachToSocket.mockResolvedValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(sessionValidatorService.validateAndAttachToSocket).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should reject connection when session validation fails', async () => {
      const mockExecutionContext = createMockWsExecutionContext({
        handshake: {
          auth: {},
          query: {},
          headers: {},
          time: new Date().toISOString(),
          address: '192.168.1.1',
          xdomain: false,
          secure: false,
          issued: Date.now(),
          url: '/socket.io/'
        }
      });

      sessionValidatorService.validateAndAttachToSocket.mockResolvedValue(false);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(sessionValidatorService.validateAndAttachToSocket).toHaveBeenCalledWith(expect.any(Object));
      const client = mockExecutionContext.switchToWs().getClient();
      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should handle session validation errors gracefully', async () => {
      const mockExecutionContext = createMockWsExecutionContext({
        handshake: {
          auth: { sessionId: 'invalid-session' },
          query: {},
          headers: {},
          time: new Date().toISOString(),
          address: '192.168.1.1',
          xdomain: false,
          secure: false,
          issued: Date.now(),
          url: '/socket.io/'
        }
      });

      const error = new Error('Database connection failed');
      sessionValidatorService.validateAndAttachToSocket.mockRejectedValue(error);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      const client = mockExecutionContext.switchToWs().getClient();
      expect(client.disconnect).toHaveBeenCalled();
    });
  });

  describe('Different Session Sources', () => {
    it('should validate sessions from handshake auth', async () => {
      const sessionId = createUUID();
      const mockExecutionContext = createMockWsExecutionContext({
        handshake: {
          auth: { sessionId },
          query: {},
          headers: {},
          time: new Date().toISOString(),
          address: '127.0.0.1',
          xdomain: false,
          secure: false,
          issued: Date.now(),
          url: '/socket.io/'
        }
      });

      sessionValidatorService.validateAndAttachToSocket.mockResolvedValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(sessionValidatorService.validateAndAttachToSocket).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should validate sessions from authorization headers', async () => {
      const sessionId = createUUID();
      const mockExecutionContext = createMockWsExecutionContext({
        handshake: {
          auth: {},
          query: {},
          headers: { authorization: `Bearer ${sessionId}` },
          time: new Date().toISOString(),
          address: '127.0.0.1',
          xdomain: false,
          secure: false,
          issued: Date.now(),
          url: '/socket.io/'
        }
      });

      sessionValidatorService.validateAndAttachToSocket.mockResolvedValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(sessionValidatorService.validateAndAttachToSocket).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should validate sessions from cookies', async () => {
      const sessionId = createUUID();
      const mockExecutionContext = createMockWsExecutionContext({
        handshake: {
          auth: {},
          query: {},
          headers: { cookie: `sessionId=${sessionId}; other=value` },
          time: new Date().toISOString(),
          address: '127.0.0.1',
          xdomain: false,
          secure: false,
          issued: Date.now(),
          url: '/socket.io/'
        }
      });

      sessionValidatorService.validateAndAttachToSocket.mockResolvedValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(sessionValidatorService.validateAndAttachToSocket).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing execution context gracefully', async () => {
      const mockExecutionContext = {
        switchToWs: () => ({
          getClient: () => null,
          getData: () => ({}),
        }),
        getClass: () => ({}),
        getHandler: () => ({}),
      } as ExecutionContext;

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(sessionValidatorService.validateAndAttachToSocket).not.toHaveBeenCalled();
    });

    it('should handle malformed clients gracefully', async () => {
      const mockClient = { disconnect: vi.fn() }; // Incomplete client object with disconnect

      const mockExecutionContext = {
        switchToWs: () => ({
          getClient: () => mockClient,
          getData: () => ({}),
        }),
        getClass: () => ({}),
        getHandler: () => ({}),
      } as ExecutionContext;

      sessionValidatorService.validateAndAttachToSocket.mockResolvedValue(false);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should handle concurrent validation requests', async () => {
      const sessionId = createUUID();
      const mockExecutionContexts = Array(5).fill(0).map(() => 
        createMockWsExecutionContext({
          handshake: {
            auth: { sessionId },
            query: {},
            headers: {},
            time: new Date().toISOString(),
            address: '127.0.0.1',
            xdomain: false,
            secure: false,
            issued: Date.now(),
            url: '/socket.io/'
          }
        })
      );

      sessionValidatorService.validateAndAttachToSocket.mockResolvedValue(true);

      const promises = mockExecutionContexts.map(context => 
        guard.canActivate(context)
      );

      const results = await Promise.all(promises);

      expect(results.every(result => result === true)).toBe(true);
      expect(sessionValidatorService.validateAndAttachToSocket).toHaveBeenCalledTimes(5);
    });
  });

  describe('Security Scenarios', () => {
    it('should reject connections with empty session data', async () => {
      const mockExecutionContext = createMockWsExecutionContext({
        handshake: {
          auth: { sessionId: '' },
          query: {},
          headers: {},
          time: new Date().toISOString(),
          address: '192.168.1.1',
          xdomain: false,
          secure: false,
          issued: Date.now(),
          url: '/socket.io/'
        }
      });

      sessionValidatorService.validateAndAttachToSocket.mockResolvedValue(false);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      const client = mockExecutionContext.switchToWs().getClient();
      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should reject connections with malformed session IDs', async () => {
      const mockExecutionContext = createMockWsExecutionContext({
        handshake: {
          auth: { sessionId: 'not-a-uuid' },
          query: {},
          headers: {},
          time: new Date().toISOString(),
          address: '192.168.1.1',
          xdomain: false,
          secure: false,
          issued: Date.now(),
          url: '/socket.io/'
        }
      });

      sessionValidatorService.validateAndAttachToSocket.mockResolvedValue(false);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      const client = mockExecutionContext.switchToWs().getClient();
      expect(client.disconnect).toHaveBeenCalled();
    });
  });
});
