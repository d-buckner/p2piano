import { Test } from '@nestjs/testing';
import { vi } from 'vitest';
import { SessionValidatorService } from '../services/session-validator.service';
import { 
  createMockSessionWithId,
  createMockHttpRequest,
  createMockHttpExecutionContext,
  createSessionAttachingMock,
  createConcurrentSessionMocks,
  createUUID
} from '../test-utils/validation.helpers';
import { AutoSessionGuard } from './auto-session.guard';
import type { ExecutionContext } from '@nestjs/common';
import type { Request, Reply } from '../types/request';


describe('AutoSessionGuard', () => {
  let guard: AutoSessionGuard;
  let sessionValidatorService: any;

  beforeEach(async () => {
    // Create mock session validator service
    sessionValidatorService = {
      getOrCreateSession: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: AutoSessionGuard,
          useFactory: () => new AutoSessionGuard(sessionValidatorService),
        },
        {
          provide: SessionValidatorService,
          useValue: sessionValidatorService,
        },
      ],
    }).compile();

    guard = module.get<AutoSessionGuard>(AutoSessionGuard);

    vi.clearAllMocks();
  });

  describe('Session Creation and Validation', () => {
    it('should create new session when none exists', async () => {
      const newSessionId = createUUID();
      const newSession = createMockSessionWithId({ sessionId: newSessionId });
      const mockReply = { cookie: vi.fn() };
      const mockExecutionContext = createMockHttpExecutionContext(
        { ip: '127.0.0.1' },
        mockReply
      );

      sessionValidatorService.getOrCreateSession = createSessionAttachingMock(newSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      const request = mockExecutionContext.switchToHttp().getRequest();
      expect(sessionValidatorService.getOrCreateSession).toHaveBeenCalledWith(request, mockReply);
      expect(request.session).toBe(newSession);
    });

    it('should return existing session when valid', async () => {
      const sessionId = createUUID();
      const existingSession = createMockSessionWithId({ sessionId });
      const mockReply = { cookie: vi.fn() };
      const mockExecutionContext = createMockHttpExecutionContext(
        {
          headers: { authorization: `Bearer ${sessionId}` },
          ip: '127.0.0.1'
        },
        mockReply
      );

      sessionValidatorService.getOrCreateSession = createSessionAttachingMock(existingSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      const request = mockExecutionContext.switchToHttp().getRequest();
      expect(request.session).toBe(existingSession);
      // Should not set cookie for existing session
      expect(mockReply.cookie).not.toHaveBeenCalled();
    });

    it('should handle session creation errors gracefully', async () => {
      const mockReply = { cookie: vi.fn() };
      const mockExecutionContext = createMockHttpExecutionContext(
        { ip: '127.0.0.1' },
        mockReply
      );

      const error = new Error('Database connection failed');
      sessionValidatorService.getOrCreateSession.mockRejectedValue(error);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      const request = mockExecutionContext.switchToHttp().getRequest();
      expect(request.session).toBeUndefined();
    });
  });

  describe('Different Request Types', () => {
    it('should handle requests with session cookies', async () => {
      const sessionId = createUUID();
      const session = createMockSessionWithId({ sessionId });
      const mockReply = { cookie: vi.fn() };
      const mockExecutionContext = createMockHttpExecutionContext(
        {
          cookies: { sessionId },
          ip: '127.0.0.1'
        },
        mockReply
      );

      sessionValidatorService.getOrCreateSession = createSessionAttachingMock(session);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      const request = mockExecutionContext.switchToHttp().getRequest();
      expect(request.session).toBe(session);
    });

    it('should handle requests with authorization headers', async () => {
      const sessionId = createUUID();
      const session = createMockSessionWithId({ sessionId });
      const mockReply = { cookie: vi.fn() };
      const mockExecutionContext = createMockHttpExecutionContext(
        {
          headers: { authorization: `Bearer ${sessionId}` },
          ip: '127.0.0.1'
        },
        mockReply
      );

      sessionValidatorService.getOrCreateSession = createSessionAttachingMock(session);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      const request = mockExecutionContext.switchToHttp().getRequest();
      expect(request.session).toBe(session);
    });

    it('should handle requests with no session information', async () => {
      const newSessionId = createUUID();
      const newSession = createMockSessionWithId({ sessionId: newSessionId });
      const mockReply = { cookie: vi.fn() };
      const mockExecutionContext = createMockHttpExecutionContext(
        { ip: '192.168.1.1' },
        mockReply
      );

      sessionValidatorService.getOrCreateSession = createSessionAttachingMock(newSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      const request = mockExecutionContext.switchToHttp().getRequest();
      expect(request.session).toBe(newSession);
    });
  });

  describe('Session Cookie Configuration', () => {
    it('should configure secure cookies in production', async () => {
      const newSessionId = createUUID();
      const newSession = createMockSessionWithId({ sessionId: newSessionId });
      const mockReply = { cookie: vi.fn() };
      const mockExecutionContext = createMockHttpExecutionContext(
        { ip: '127.0.0.1' },
        mockReply
      );

      // Mock a new session creation scenario
      sessionValidatorService.getOrCreateSession.mockImplementation(async (req: Request, reply: Reply) => {
        // Simulate setting the cookie
        reply.cookie('sessionId', newSessionId, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24 * 30,
          path: '/',
        });
        req.session = newSession;
        return newSession;
      });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockReply.cookie).toHaveBeenCalledWith('sessionId', newSessionId, expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      }));
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing request context gracefully', async () => {
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => null,
          getResponse: () => ({}),
        }),
        getClass: () => ({}),
        getHandler: () => ({}),
      } as ExecutionContext;

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(sessionValidatorService.getOrCreateSession).not.toHaveBeenCalled();
    });

    it('should handle missing response context gracefully', async () => {
      const mockRequest = createMockHttpRequest({ ip: '127.0.0.1' });
      
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => null,
        }),
        getClass: () => ({}),
        getHandler: () => ({}),
      } as ExecutionContext;

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(sessionValidatorService.getOrCreateSession).not.toHaveBeenCalled();
    });

    it('should handle concurrent requests properly', async () => {
      const newSessionIds = Array(3).fill(0).map(() => createUUID());
      const newSessions = newSessionIds.map(id => createMockSessionWithId({ sessionId: id }));
      
      sessionValidatorService.getOrCreateSession = createConcurrentSessionMocks(newSessions);

      const mockExecutionContexts = Array(3).fill(0).map(() => 
        createMockHttpExecutionContext({ ip: '127.0.0.1' })
      );

      const promises = mockExecutionContexts.map(context => 
        guard.canActivate(context)
      );

      const results = await Promise.all(promises);

      expect(results.every(result => result === true)).toBe(true);
      expect(sessionValidatorService.getOrCreateSession).toHaveBeenCalledTimes(3);
      
      // Verify each request got its own session
      mockExecutionContexts.forEach((context, index) => {
        const request = context.switchToHttp().getRequest();
        expect(request.session).toBe(newSessions[index]);
      });
    });
  });

  describe('IP Address Handling', () => {
    it('should pass client IP to session creation', async () => {
      const newSessionId = createUUID();
      const newSession = createMockSessionWithId({ 
        sessionId: newSessionId,
        ipAddress: '203.0.113.1'
      });
      const mockReply = { cookie: vi.fn() };
      const mockExecutionContext = createMockHttpExecutionContext(
        { 
          ip: '203.0.113.1',
          headers: { 'x-forwarded-for': '203.0.113.1' }
        },
        mockReply
      );

      sessionValidatorService.getOrCreateSession = createSessionAttachingMock(newSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      const request = mockExecutionContext.switchToHttp().getRequest();
      expect(sessionValidatorService.getOrCreateSession).toHaveBeenCalledWith(request, mockReply);
      expect(request.session.ipAddress).toBe('203.0.113.1');
    });

    it('should handle requests from different IP addresses', async () => {
      const testIPs = ['127.0.0.1', '192.168.1.100', '10.0.0.1'];
      
      for (const ip of testIPs) {
        const newSessionId = createUUID();
        const newSession = createMockSessionWithId({ 
          sessionId: newSessionId,
          ipAddress: ip
        });
        const mockReply = { cookie: vi.fn() };
        const mockExecutionContext = createMockHttpExecutionContext(
          { ip },
          mockReply
        );

        sessionValidatorService.getOrCreateSession = createSessionAttachingMock(newSession);

        const result = await guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
        const request = mockExecutionContext.switchToHttp().getRequest();
        expect(request.session.ipAddress).toBe(ip);
        
        vi.clearAllMocks();
      }
    });
  });
});
