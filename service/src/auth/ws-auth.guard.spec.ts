import { ExecutionContext } from '@nestjs/common';
import { WsAuthGuard } from './ws-auth.guard';
import SessionProvider from '../entities/Session';

// Mock SessionProvider
jest.mock('../entities/Session');

describe('WsAuthGuard', () => {
  let guard: WsAuthGuard;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockClient: any;
  let mockSessionProvider: jest.Mocked<typeof SessionProvider>;

  beforeEach(() => {
    mockSessionProvider = SessionProvider as jest.Mocked<typeof SessionProvider>;
    guard = new WsAuthGuard();
    mockClient = {
      handshake: {
        auth: {},
        query: {},
        headers: {},
      },
      disconnect: jest.fn(),
    };

    mockExecutionContext = {
      switchToWs: jest.fn().mockReturnValue({
        getClient: () => mockClient,
      }),
    } as any;

    jest.clearAllMocks();
  });

  describe('valid sessions', () => {
    it('should allow connection with valid session in handshake auth', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = { sessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockClient.handshake.auth.sessionId = sessionId;
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
      expect(mockClient.session).toBe(mockSession);
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should allow connection with valid session in query parameters', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = { sessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockClient.handshake.query.sessionId = sessionId;
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
      expect(mockClient.session).toBe(mockSession);
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should allow connection with valid session in Authorization header', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = { sessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockClient.handshake.headers.authorization = `Bearer ${sessionId}`;
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
      expect(mockClient.session).toBe(mockSession);
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should prioritize handshake auth over other methods', async () => {
      const authSessionId = '550e8400-e29b-41d4-a716-446655440000';
      const querySessionId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      const mockSession = { sessionId: authSessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockClient.handshake.auth.sessionId = authSessionId;
      mockClient.handshake.query.sessionId = querySessionId;
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(SessionProvider.get).toHaveBeenCalledWith(authSessionId);
      expect(mockSessionProvider.get).not.toHaveBeenCalledWith(querySessionId);
    });
  });

  describe('invalid sessions', () => {
    it('should disconnect client and return false when no session provided', async () => {
      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should disconnect client and return false when session does not exist', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockClient.handshake.auth.sessionId = sessionId;
      mockSessionProvider.get.mockResolvedValue(null);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
    });

    it('should disconnect client and return false when SessionProvider throws error', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockClient.handshake.auth.sessionId = sessionId;
      mockSessionProvider.get.mockRejectedValue(new Error('Session not found'));

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
    });

    it('should disconnect client for malformed Authorization header', async () => {
      mockClient.handshake.headers.authorization = 'Invalid format';

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should disconnect client for Authorization header without Bearer prefix', async () => {
      mockClient.handshake.headers.authorization = '550e8400-e29b-41d4-a716-446655440000';

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should disconnect client for empty sessionId', async () => {
      mockClient.handshake.auth.sessionId = '';

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });
  });

  describe('session extraction priority', () => {
    it('should extract from handshake auth first', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = { sessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockClient.handshake.auth.sessionId = sessionId;
      mockClient.handshake.query.sessionId = 'different-session';
      mockClient.handshake.headers.authorization = 'Bearer another-session';
      mockSessionProvider.get.mockResolvedValue(mockSession);

      await guard.canActivate(mockExecutionContext);

      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
    });

    it('should fallback to query when auth is not available', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = { sessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockClient.handshake.query.sessionId = sessionId;
      mockClient.handshake.headers.authorization = 'Bearer another-session';
      mockSessionProvider.get.mockResolvedValue(mockSession);

      await guard.canActivate(mockExecutionContext);

      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
    });

    it('should fallback to Authorization header when auth and query are not available', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = { sessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockClient.handshake.headers.authorization = `Bearer ${sessionId}`;
      mockSessionProvider.get.mockResolvedValue(mockSession);

      await guard.canActivate(mockExecutionContext);

      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('error handling', () => {
    it('should handle missing handshake gracefully', async () => {
      mockClient.handshake = undefined;

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should handle missing handshake properties gracefully', async () => {
      mockClient.handshake = {};

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should handle null handshake properties gracefully', async () => {
      mockClient.handshake = {
        auth: null,
        query: null,
        headers: null,
      };

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });
});