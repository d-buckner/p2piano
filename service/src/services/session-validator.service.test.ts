import { Test } from '@nestjs/testing';
import { vi } from 'vitest';
import { SessionConfigService } from '../config/session-config.service';
import SessionProvider from '../entities/Session';
import { 
  createMockSessionWithId,
  createMockHttpRequest,
  createMockWsClient,
  createUUID 
} from '../test-utils/validation.helpers';
import { SessionValidatorService } from './session-validator.service';

// Mock dependencies
vi.mock('../entities/Session');
vi.mock('../config/ConfigProvider');

describe('SessionValidatorService', () => {
  let service: SessionValidatorService;
  let mockSessionProvider: any;

  beforeEach(async () => {
    mockSessionProvider = SessionProvider as any;

    // Set up mock implementations
    mockSessionProvider.get = vi.fn();
    mockSessionProvider.create = vi.fn();

    const module = await Test.createTestingModule({
      providers: [
        SessionValidatorService,
        SessionConfigService,
      ],
    }).compile();

    service = module.get<SessionValidatorService>(SessionValidatorService);

    vi.clearAllMocks();
  });

  describe('validateRequest', () => {
    it('should return session when request has valid authorization header', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${sessionId}` },
        ip: '192.168.1.1'
      });

      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await service.validateRequest(mockRequest as any);

      expect(result).toBe(mockSession);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
    });

    it('should return session when request has valid session cookie', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const mockRequest = createMockHttpRequest({
        cookies: { sessionId },
        ip: '192.168.1.1'
      });

      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await service.validateRequest(mockRequest as any);

      expect(result).toBe(mockSession);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
    });

    it('should return null when no session ID found', async () => {
      const mockRequest = createMockHttpRequest(); // No session info

      const result = await service.validateRequest(mockRequest as any);

      expect(result).toBeNull();
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should return null when session validation fails', async () => {
      const sessionId = createUUID();
      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${sessionId}` },
        ip: '192.168.1.1'
      });

      mockSessionProvider.get.mockRejectedValue(new Error('Session not found'));

      const result = await service.validateRequest(mockRequest as any);

      expect(result).toBeNull();
    });

    it('should return null when session provider returns null', async () => {
      const sessionId = createUUID();
      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${sessionId}` },
        ip: '192.168.1.1'
      });

      mockSessionProvider.get.mockResolvedValue(null);

      const result = await service.validateRequest(mockRequest as any);

      expect(result).toBeNull();
    });
  });

  describe('validateSocket', () => {
    it('should return session when socket has valid session in auth', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const mockSocket = createMockWsClient();
      (mockSocket as any).handshake = {
        ...(mockSocket.handshake || {}),
        auth: { sessionId },
        address: '192.168.1.1'
      };

      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await service.validateSocket(mockSocket as any);

      expect(result).toBe(mockSession);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
    });

    it('should return session when socket has valid session in headers', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const mockSocket = createMockWsClient();
      (mockSocket as any).handshake = {
        ...(mockSocket.handshake || {}),
        headers: { authorization: `Bearer ${sessionId}` },
        address: '192.168.1.1'
      };

      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await service.validateSocket(mockSocket as any);

      expect(result).toBe(mockSession);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
    });

    it('should return null when no session ID found in socket', async () => {
      const mockSocket = createMockWsClient(); // No session info

      const result = await service.validateSocket(mockSocket as any);

      expect(result).toBeNull();
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should return null when socket session validation fails', async () => {
      const sessionId = createUUID();
      const mockSocket = createMockWsClient();
      (mockSocket as any).handshake = {
        ...(mockSocket.handshake || {}),
        auth: { sessionId },
        address: '192.168.1.1'
      };

      mockSessionProvider.get.mockRejectedValue(new Error('Session not found'));

      const result = await service.validateSocket(mockSocket as any);

      expect(result).toBeNull();
    });
  });

  describe('validateRawRequest', () => {
    it('should return session when raw request has valid session in URL', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const mockRawRequest = { 
        url: `/socket.io/?auth.sessionId=${sessionId}`, 
        headers: {},
        socket: { remoteAddress: '192.168.1.1' }
      };

      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await service.validateRawRequest(mockRawRequest);

      expect(result).toBe(mockSession);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
    });

    it('should return session when raw request has valid session in headers', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const mockRawRequest = { 
        url: '/socket.io/', 
        headers: { authorization: `Bearer ${sessionId}` },
        socket: { remoteAddress: '192.168.1.1' }
      };

      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await service.validateRawRequest(mockRawRequest);

      expect(result).toBe(mockSession);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
    });

    it('should return null when raw request has no session ID', async () => {
      const mockRawRequest = { url: '/socket.io/', headers: {} };

      const result = await service.validateRawRequest(mockRawRequest);

      expect(result).toBeNull();
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });
  });

  describe('validateAndAttachToRequest', () => {
    it('should attach session to request when validation succeeds', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${sessionId}` },
        ip: '192.168.1.1'
      });

      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await service.validateAndAttachToRequest(mockRequest as any);

      expect(result).toBe(true);
      expect(mockRequest.session).toBe(mockSession);
    });

    it('should not attach session when validation fails', async () => {
      const mockRequest = createMockHttpRequest(); // No session info

      const result = await service.validateAndAttachToRequest(mockRequest as any);

      expect(result).toBe(false);
      expect(mockRequest.session).toBeUndefined();
    });
  });

  describe('validateAndAttachToSocket', () => {
    it('should attach session to socket when validation succeeds', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const mockSocket = createMockWsClient();
      (mockSocket as any).handshake = {
        ...(mockSocket.handshake || {}),
        auth: { sessionId },
        address: '192.168.1.1'
      };

      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await service.validateAndAttachToSocket(mockSocket as any);

      expect(result).toBe(true);
      expect((mockSocket as any).session).toBe(mockSession);
    });

    it('should not attach session when validation fails', async () => {
      const mockSocket = createMockWsClient(); // No session info

      const result = await service.validateAndAttachToSocket(mockSocket as any);

      expect(result).toBe(false);
      expect((mockSocket as any).session).toBeUndefined();
    });
  });

  describe('getOrCreateSession', () => {
    it('should return existing session when valid', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${sessionId}` },
        ip: '192.168.1.1'
      });
      const mockReply = { cookie: vi.fn() };

      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await service.getOrCreateSession(mockRequest as any, mockReply as any);

      expect(result).toBe(mockSession);
      expect(mockRequest.session).toBe(mockSession);
      expect(mockReply.cookie).not.toHaveBeenCalled();
    });

    it('should create new session when no existing session', async () => {
      const newSessionId = createUUID();
      const newSession = createMockSessionWithId({ sessionId: newSessionId });
      const mockRequest = createMockHttpRequest({ ip: '192.168.1.1' });
      const mockReply = { cookie: vi.fn() };

      mockSessionProvider.create.mockResolvedValue(newSession);

      const result = await service.getOrCreateSession(mockRequest as any, mockReply as any);

      expect(result).toBe(newSession);
      expect(mockRequest.session).toBe(newSession);
      expect(mockReply.cookie).toHaveBeenCalledWith('sessionId', newSessionId, expect.any(Object));
    });
  });
});
