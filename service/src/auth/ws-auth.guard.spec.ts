import { vi } from 'vitest';
import { WsAuthGuard } from './ws-auth.guard';
import SessionProvider from '../entities/Session';
import { SessionExtractor } from '../utils/session-extractor';
import { 
  createMockSessionWithId, 
  createUUID
} from '../test-utils/validation.helpers';

// Mock SessionProvider and SessionExtractor
vi.mock('../entities/Session');
vi.mock('../utils/session-extractor');

describe('WsAuthGuard', () => {
  let guard: WsAuthGuard;
  let mockExecutionContext: any;
  let mockClient: any;
  let mockSessionProvider: any;
  let mockSessionExtractor: any;

  beforeEach(() => {
    mockSessionProvider = SessionProvider as any;
    mockSessionExtractor = SessionExtractor as any;
    
    // Set up mock implementations
    mockSessionProvider.get = vi.fn();
    mockSessionExtractor.extractSessionIdFromSocket = vi.fn();
    
    guard = new WsAuthGuard();
    mockClient = {
      handshake: {
        auth: {},
        query: {},
        headers: {},
        address: '192.168.1.1',
      },
      disconnect: vi.fn(),
    };

    mockExecutionContext = {
      switchToWs: vi.fn(() => ({
        getClient: () => mockClient,
      })),
    } as any;

    vi.clearAllMocks();
  });

  describe('valid sessions', () => {
    it('should allow connection with valid session in handshake auth', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionExtractor.extractSessionIdFromSocket).toHaveBeenCalledWith(mockClient);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
      expect(mockClient.session).toBe(mockSession);
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should allow connection with valid session in Authorization header', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionExtractor.extractSessionIdFromSocket).toHaveBeenCalledWith(mockClient);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
      expect(mockClient.session).toBe(mockSession);
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should prioritize handshake auth over other methods', async () => {
      const authSessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId: authSessionId });
      
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(authSessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionExtractor.extractSessionIdFromSocket).toHaveBeenCalledWith(mockClient);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(authSessionId, '192.168.1.1');
    });
  });

  describe('invalid sessions', () => {
    it('should disconnect client and return false when no session provided', async () => {
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(null);
      
      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockSessionExtractor.extractSessionIdFromSocket).toHaveBeenCalledWith(mockClient);
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should disconnect client and return false when session does not exist', async () => {
      const sessionId = createUUID();
      
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(null);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockSessionExtractor.extractSessionIdFromSocket).toHaveBeenCalledWith(mockClient);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
    });

    it('should disconnect client and return false when SessionProvider throws error', async () => {
      const sessionId = createUUID();
      
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(sessionId);
      mockSessionProvider.get.mockRejectedValue(new Error('Session not found'));

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockSessionExtractor.extractSessionIdFromSocket).toHaveBeenCalledWith(mockClient);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
    });

    it('should disconnect client for malformed Authorization header', async () => {
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(null);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockSessionExtractor.extractSessionIdFromSocket).toHaveBeenCalledWith(mockClient);
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should disconnect client for Authorization header without Bearer prefix', async () => {
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(null);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockSessionExtractor.extractSessionIdFromSocket).toHaveBeenCalledWith(mockClient);
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should disconnect client for empty sessionId', async () => {
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue('');

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockSessionExtractor.extractSessionIdFromSocket).toHaveBeenCalledWith(mockClient);
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });
  });

  describe('session extraction priority', () => {
    it('should extract from handshake auth first', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      await guard.canActivate(mockExecutionContext);

      expect(mockSessionExtractor.extractSessionIdFromSocket).toHaveBeenCalledWith(mockClient);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
    });

    it('should fallback to Authorization header when auth and query are not available', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      
      mockSessionExtractor.extractSessionIdFromSocket.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      await guard.canActivate(mockExecutionContext);

      expect(mockSessionExtractor.extractSessionIdFromSocket).toHaveBeenCalledWith(mockClient);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
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