import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from '../auth/auth.guard';
import { AutoSessionGuard } from '../auth/auto-session.guard';
import { WsAuthGuard } from '../auth/ws-auth.guard';
import { SessionValidatorService } from '../services/session-validator.service';
import { SessionIoAdapter } from '../adapters/session-io.adapter';
import { AuthModule } from '../auth/auth.module';
import SessionProvider from '../entities/Session';
import { 
  createMockSessionWithId,
  createMockHttpRequest,
  createMockWsClient,
  createUUID 
} from '../test-utils/validation.helpers';

import { vi } from 'vitest';

// Mock external dependencies
vi.mock('../entities/Session');

describe('Session Validation Flow (E2E)', () => {
  let app: INestApplication;
  let sessionValidatorService: SessionValidatorService;
  let mockSessionProvider: any;

  beforeAll(async () => {
    mockSessionProvider = SessionProvider as any;

    // Set up mock implementations
    mockSessionProvider.get = vi.fn();
    mockSessionProvider.create = vi.fn();

    const moduleRef = await Test.createTestingModule({
      imports: [
        AuthModule,
        ThrottlerModule.forRoot([
          {
            name: 'default',
            ttl: 60000,
            limit: 100,
          },
        ]),
      ],
      providers: [AuthGuard, AutoSessionGuard, WsAuthGuard],
    }).compile();

    app = moduleRef.createNestApplication();
    sessionValidatorService = app.get<SessionValidatorService>(SessionValidatorService);

    // Set up SessionIoAdapter
    app.useWebSocketAdapter(new SessionIoAdapter(app));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HTTP Request Validation Flow', () => {
    it('should validate complete HTTP request flow with valid session', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${sessionId}` },
        ip: '192.168.1.100'
      });

      // Mock SessionProvider
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);

      expect(result).toBe(true);
      expect(mockRequest.session).toBe(mockSession);
      
      // Verify session was fetched
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.100');
    });

    it('should handle complete HTTP request flow with invalid session', async () => {
      const sessionId = createUUID();
      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${sessionId}` },
        ip: '192.168.1.100'
      });

      mockSessionProvider.get.mockResolvedValue(null); // Invalid session

      const result = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);

      expect(result).toBe(false);
      expect(mockRequest.session).toBeUndefined();
    });

    it('should handle session creation flow for auto-session scenarios', async () => {
      const newSessionId = createUUID();
      const newSession = createMockSessionWithId({ sessionId: newSessionId });
      const mockRequest = createMockHttpRequest({ ip: '192.168.1.100' });
      const mockReply = { cookie: vi.fn() } as any;

      // Mock session creation
      mockSessionProvider.create.mockResolvedValue(newSession);

      const result = await sessionValidatorService.getOrCreateSession(mockRequest as any, mockReply);

      expect(result).toBe(newSession);
      expect(mockRequest.session).toBe(newSession);
      expect(mockReply.cookie).toHaveBeenCalledWith('sessionId', newSessionId, expect.any(Object));
    });
  });

  describe('WebSocket Validation Flow', () => {
    it('should validate complete WebSocket flow with valid session', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const mockSocket = createMockWsClient({
        handshake: {
          auth: { sessionId },
          address: '192.168.1.100'
        }
      });

      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await sessionValidatorService.validateAndAttachToSocket(mockSocket as any);

      expect(result).toBe(true);
      expect(mockSocket.session).toBe(mockSession);
      
      // Verify session was fetched
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.100');
    });

    it('should handle WebSocket raw request validation for allowRequest', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const mockRawRequest = {
        url: `/socket.io/?auth.sessionId=${sessionId}`,
        headers: {},
        socket: { remoteAddress: '192.168.1.100' }
      };

      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await sessionValidatorService.validateRawRequest(mockRawRequest);

      expect(result).toBe(mockSession);
      
      // Verify session was fetched
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.100');
    });
  });

  describe('Cross-Platform Session Consistency', () => {
    it('should validate same session across HTTP and WebSocket', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const ipAddress = '192.168.1.100';

      // HTTP request validation
      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${sessionId}` },
        ip: ipAddress
      });

      // WebSocket validation  
      const mockSocket = createMockWsClient({
        handshake: {
          auth: { sessionId },
          address: ipAddress
        }
      });

      // Mock consistent responses
      mockSessionProvider.get.mockResolvedValue(mockSession);

      // Test HTTP validation
      const httpResult = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);
      
      // Test WebSocket validation
      const wsResult = await sessionValidatorService.validateAndAttachToSocket(mockSocket as any);

      expect(httpResult).toBe(true);
      expect(wsResult).toBe(true);
      expect(mockRequest.session).toEqual(mockSession);
      expect(mockSocket.session).toEqual(mockSession);

      // Verify both calls used the same session validation
      expect(mockSessionProvider.get).toHaveBeenCalledTimes(2);
      expect(mockSessionProvider.get).toHaveBeenNthCalledWith(1, sessionId, ipAddress);
      expect(mockSessionProvider.get).toHaveBeenNthCalledWith(2, sessionId, ipAddress);
    });

    it('should handle session validation failure consistently', async () => {
      const sessionId = createUUID();
      const ipAddress = '192.168.1.100';

      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${sessionId}` },
        ip: ipAddress
      });

      const mockSocket = createMockWsClient({
        handshake: {
          auth: { sessionId },
          address: ipAddress
        }
      });

      // Mock consistent failure responses
      mockSessionProvider.get.mockResolvedValue(null); // Session not found

      const httpResult = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);
      const wsResult = await sessionValidatorService.validateAndAttachToSocket(mockSocket as any);

      expect(httpResult).toBe(false);
      expect(wsResult).toBe(false);
      expect(mockRequest.session).toBeUndefined();
      expect(mockSocket.session).toBeUndefined();
    });
  });

  describe('Session Validation Consistency', () => {
    it('should validate sessions consistently across different contexts', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const ipAddress = '203.0.113.1';

      // Test HTTP request validation
      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${sessionId}` },
        ip: ipAddress
      });

      // Test WebSocket validation  
      const mockSocket = createMockWsClient({
        handshake: {
          auth: { sessionId },
          address: ipAddress
        }
      });

      // Test raw request validation
      const mockRawRequest = {
        url: `/socket.io/?auth.sessionId=${sessionId}`,
        headers: {},
        socket: { remoteAddress: ipAddress }
      };

      mockSessionProvider.get.mockResolvedValue(mockSession);

      // Test all contexts
      const httpResult = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);
      const wsResult = await sessionValidatorService.validateAndAttachToSocket(mockSocket as any);
      const rawResult = await sessionValidatorService.validateRawRequest(mockRawRequest);

      expect(httpResult).toBe(true);
      expect(wsResult).toBe(true);
      expect(rawResult).toBe(mockSession);
      expect(mockRequest.session).toBe(mockSession);
      expect(mockSocket.session).toBe(mockSession);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle SessionProvider errors gracefully across all contexts', async () => {
      const sessionId = createUUID();
      const error = new Error('Database connection failed');

      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${sessionId}` }
      });
      
      const mockSocket = createMockWsClient({
        handshake: { auth: { sessionId } }
      });

      const mockRawRequest = {
        url: `/socket.io/?auth.sessionId=${sessionId}`,
        headers: {}
      };

      // Setup mocks to throw error
      mockSessionProvider.get.mockRejectedValue(error);

      // Test all contexts handle errors gracefully
      const httpResult = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);
      const wsResult = await sessionValidatorService.validateAndAttachToSocket(mockSocket as any);
      const rawResult = await sessionValidatorService.validateRawRequest(mockRawRequest);

      expect(httpResult).toBe(false);
      expect(wsResult).toBe(false);
      expect(rawResult).toBeNull();
      
      // Ensure no sessions were attached on error
      expect(mockRequest.session).toBeUndefined();
      expect(mockSocket.session).toBeUndefined();
    });

    it('should handle malformed requests gracefully', async () => {
      // Test with request that has no session info
      const mockRequest = createMockHttpRequest();
        
      // Should not throw, should return false
      const result = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);
        
      expect(result).toBe(false);
      expect(mockRequest.session).toBeUndefined();
    });
  });

  describe('Performance and Resource Management', () => {
    it('should not leak memory with repeated session validations', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      
      mockSessionProvider.get.mockResolvedValue(mockSession);

      // Perform many validations
      const validations = Array(100).fill(0).map(async () => {
        const mockRequest = createMockHttpRequest({
          headers: { authorization: `Bearer ${sessionId}` }
        });
        
        return sessionValidatorService.validateAndAttachToRequest(mockRequest as any);
      });

      const results = await Promise.all(validations);

      expect(results.every(result => result === true)).toBe(true);
      expect(mockSessionProvider.get).toHaveBeenCalledTimes(100);
    });

    it('should handle concurrent session validations correctly', async () => {
      const sessionIds = Array(10).fill(0).map(() => createUUID());
      const sessions = sessionIds.map(id => createMockSessionWithId({ sessionId: id }));
      
      mockSessionProvider.get.mockImplementation((sessionId: string) => {
        const session = sessions.find(s => s.sessionId === sessionId);
        return Promise.resolve(session || null);
      });

      // Create concurrent validations for different sessions
      const validations = sessionIds.map(async (sessionId) => {
        const mockRequest = createMockHttpRequest({
          headers: { authorization: `Bearer ${sessionId}` }
        });
        
        const result = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);
        return { result, sessionId, session: mockRequest.session };
      });

      const results = await Promise.all(validations);

      // All should succeed
      expect(results.every(r => r.result === true)).toBe(true);
      
      // Each should have the correct session attached
      results.forEach((r, index) => {
        expect(r.session?.sessionId).toBe(sessionIds[index]);
      });
    });
  });
});