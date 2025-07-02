import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AutoSessionGuard } from './auto-session.guard';
import SessionProvider from '../entities/Session';
import ConfigProvider from '../config/ConfigProvider';
import { SessionExtractor } from '../utils/session-extractor';
import { 
  createMockSessionWithId, 
  createUUID
} from '../test-utils/validation.helpers';

// Mock dependencies
vi.mock('../entities/Session');
vi.mock('../config/ConfigProvider');
vi.mock('../utils/session-extractor');

describe('AutoSessionGuard', () => {
  let guard: AutoSessionGuard;
  let mockExecutionContext: any;
  let mockRequest: any;
  let mockResponse: any;
  let mockSessionProvider: any;
  let mockConfigProvider: any;
  let mockSessionExtractor: any;

  beforeEach(() => {
    // Set up mocks
    mockSessionProvider = SessionProvider as any;
    mockConfigProvider = ConfigProvider as any;
    mockSessionExtractor = SessionExtractor as any;

    // Mock implementations
    mockSessionProvider.get = vi.fn();
    mockSessionProvider.create = vi.fn();
    mockConfigProvider.isProduction = vi.fn();
    mockSessionExtractor.extractSessionId = vi.fn();

    // Mock request and response
    mockRequest = {
      ip: '192.168.1.1',
      headers: {
        'user-agent': 'Mozilla/5.0 Test Browser',
      },
    };

    mockResponse = {
      cookie: vi.fn(),
    };

    mockExecutionContext = {
      switchToHttp: vi.fn(() => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      })),
    } as any;

    guard = new AutoSessionGuard();

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Existing valid session', () => {
    it('should return true and attach session when valid session exists', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });

      mockSessionExtractor.extractSessionId.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionExtractor.extractSessionId).toHaveBeenCalledWith(mockRequest);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, mockRequest.ip);
      expect(mockRequest.session).toBe(mockSession);
      expect(mockSessionProvider.create).not.toHaveBeenCalled();
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should use existing session with correct IP validation', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      mockRequest.ip = '10.0.0.1';

      mockSessionExtractor.extractSessionId.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '10.0.0.1');
      expect(mockRequest.session).toBe(mockSession);
    });

    it('should handle missing user agent gracefully with existing session', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      mockRequest.headers = {}; // No user-agent

      mockSessionExtractor.extractSessionId.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.session).toBe(mockSession);
    });
  });

  describe('No existing session', () => {
    it('should create new session when no sessionId is provided', async () => {
      const newSessionId = createUUID();
      const newSession = createMockSessionWithId({ sessionId: newSessionId });

      mockSessionExtractor.extractSessionId.mockReturnValue(null);
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(false);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.create).toHaveBeenCalledWith(
        mockRequest.ip,
        mockRequest.headers['user-agent']
      );
      expect(mockRequest.session).toBe(newSession);
      expect(mockResponse.cookie).toHaveBeenCalledWith('sessionId', newSessionId, {
        httpOnly: true,
        secure: false, // Non-production
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      });
    });

    it('should create new session when sessionId is empty string', async () => {
      const newSession = createMockSessionWithId();

      mockSessionExtractor.extractSessionId.mockReturnValue('');
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(false);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.create).toHaveBeenCalled();
      expect(mockRequest.session).toBe(newSession);
    });

    it('should create new session without user agent', async () => {
      const newSession = createMockSessionWithId();
      mockRequest.headers = {}; // No user-agent

      mockSessionExtractor.extractSessionId.mockReturnValue(null);
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(false);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.create).toHaveBeenCalledWith(
        mockRequest.ip,
        undefined
      );
      expect(mockRequest.session).toBe(newSession);
    });
  });

  describe('Invalid existing session', () => {
    it('should create new session when existing session is invalid', async () => {
      const oldSessionId = createUUID();
      const newSession = createMockSessionWithId();

      mockSessionExtractor.extractSessionId.mockReturnValue(oldSessionId);
      mockSessionProvider.get.mockRejectedValue(new Error('Session not found'));
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(false);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(oldSessionId, mockRequest.ip);
      expect(mockSessionProvider.create).toHaveBeenCalledWith(
        mockRequest.ip,
        mockRequest.headers['user-agent']
      );
      expect(mockRequest.session).toBe(newSession);
      expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it('should create new session when existing session returns null', async () => {
      const oldSessionId = createUUID();
      const newSession = createMockSessionWithId();

      mockSessionExtractor.extractSessionId.mockReturnValue(oldSessionId);
      mockSessionProvider.get.mockResolvedValue(null);
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(false);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.create).toHaveBeenCalled();
      expect(mockRequest.session).toBe(newSession);
    });

    it('should handle IP mismatch by creating new session', async () => {
      const oldSessionId = createUUID();
      const newSession = createMockSessionWithId();

      mockSessionExtractor.extractSessionId.mockReturnValue(oldSessionId);
      mockSessionProvider.get.mockRejectedValue(new Error('IP mismatch'));
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.create).toHaveBeenCalled();
      expect(mockRequest.session).toBe(newSession);
    });
  });

  describe('Cookie configuration', () => {
    it('should set secure cookie in production', async () => {
      const newSession = createMockSessionWithId();

      mockSessionExtractor.extractSessionId.mockReturnValue(null);
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(true);

      await guard.canActivate(mockExecutionContext);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'sessionId',
        newSession.sessionId,
        {
          httpOnly: true,
          secure: true, // Production
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        }
      );
    });

    it('should set non-secure cookie in development', async () => {
      const newSession = createMockSessionWithId();

      mockSessionExtractor.extractSessionId.mockReturnValue(null);
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(false);

      await guard.canActivate(mockExecutionContext);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'sessionId',
        newSession.sessionId,
        {
          httpOnly: true,
          secure: false, // Development
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        }
      );
    });

    it('should set cookie with correct expiration time', async () => {
      const newSession = createMockSessionWithId();

      mockSessionExtractor.extractSessionId.mockReturnValue(null);
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(false);

      await guard.canActivate(mockExecutionContext);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'sessionId',
        expect.any(String),
        expect.objectContaining({
          maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        })
      );
    });

    it('should set cookie with security attributes', async () => {
      const newSession = createMockSessionWithId();

      mockSessionExtractor.extractSessionId.mockReturnValue(null);
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(true);

      await guard.canActivate(mockExecutionContext);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'sessionId',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true, // Prevent XSS
          sameSite: 'strict', // CSRF protection
          path: '/', // Available on all paths
        })
      );
    });
  });

  describe('Request context handling', () => {
    it('should extract request and response from execution context', async () => {
      const newSession = createMockSessionWithId();

      mockSessionExtractor.extractSessionId.mockReturnValue(null);
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(false);

      await guard.canActivate(mockExecutionContext);

      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
    });

    it('should handle different IP address formats', async () => {
      const testIPs = ['127.0.0.1', '::1', '192.168.1.100', '2001:db8::1'];
      
      for (const ip of testIPs) {
        vi.clearAllMocks();
        
        const newSession = createMockSessionWithId();
        mockRequest.ip = ip;

        mockSessionExtractor.extractSessionId.mockReturnValue(null);
        mockSessionProvider.create.mockResolvedValue(newSession);
        mockConfigProvider.isProduction.mockReturnValue(false);

        await guard.canActivate(mockExecutionContext);

        expect(mockSessionProvider.create).toHaveBeenCalledWith(ip, expect.any(String));
      }
    });

    it('should handle different user agent strings', async () => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        '',
        undefined,
      ];

      for (const userAgent of userAgents) {
        vi.clearAllMocks();
        
        const newSession = createMockSessionWithId();
        if (userAgent !== undefined) {
          mockRequest.headers = { 'user-agent': userAgent };
        } else {
          mockRequest.headers = {};
        }

        mockSessionExtractor.extractSessionId.mockReturnValue(null);
        mockSessionProvider.create.mockResolvedValue(newSession);
        mockConfigProvider.isProduction.mockReturnValue(false);

        await guard.canActivate(mockExecutionContext);

        expect(mockSessionProvider.create).toHaveBeenCalledWith(
          mockRequest.ip,
          userAgent === undefined ? undefined : userAgent
        );
      }
    });
  });

  describe('Error handling', () => {
    it('should handle session creation errors gracefully', async () => {
      const createError = new Error('Failed to create session');

      mockSessionExtractor.extractSessionId.mockReturnValue(null);
      mockSessionProvider.create.mockRejectedValue(createError);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Failed to create session');
    });

    it('should handle cookie setting errors gracefully', async () => {
      const newSession = createMockSessionWithId();

      mockSessionExtractor.extractSessionId.mockReturnValue(null);
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(false);
      mockResponse.cookie.mockImplementation(() => {
        throw new Error('Cookie setting failed');
      });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Cookie setting failed');
    });

    it('should handle missing headers gracefully', async () => {
      const newSession = createMockSessionWithId();
      mockRequest.headers = {};

      mockSessionExtractor.extractSessionId.mockReturnValue(null);
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(false);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.create).toHaveBeenCalledWith(mockRequest.ip, undefined);
    });
  });

  describe('Session attachment', () => {
    it('should always attach session to request', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });

      mockSessionExtractor.extractSessionId.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      await guard.canActivate(mockExecutionContext);

      expect(mockRequest.session).toBe(mockSession);
    });

    it('should attach new session to request when created', async () => {
      const newSession = createMockSessionWithId();

      mockSessionExtractor.extractSessionId.mockReturnValue(null);
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(false);

      await guard.canActivate(mockExecutionContext);

      expect(mockRequest.session).toBe(newSession);
    });

    it('should overwrite any existing session on request', async () => {
      const oldSession = createMockSessionWithId({ sessionId: 'old-session' });
      const newSession = createMockSessionWithId({ sessionId: 'new-session' });
      mockRequest.session = oldSession;

      mockSessionExtractor.extractSessionId.mockReturnValue(null);
      mockSessionProvider.create.mockResolvedValue(newSession);
      mockConfigProvider.isProduction.mockReturnValue(false);

      await guard.canActivate(mockExecutionContext);

      expect(mockRequest.session).toBe(newSession);
      expect(mockRequest.session).not.toBe(oldSession);
    });
  });

  describe('Return value', () => {
    it('should always return true for successful operations', async () => {
      const testCases = [
        // Existing valid session
        async () => {
          const sessionId = createUUID();
          const mockSession = createMockSessionWithId({ sessionId });
          mockSessionExtractor.extractSessionId.mockReturnValue(sessionId);
          mockSessionProvider.get.mockResolvedValue(mockSession);
        },
        // New session creation
        async () => {
          const newSession = createMockSessionWithId();
          mockSessionExtractor.extractSessionId.mockReturnValue(null);
          mockSessionProvider.create.mockResolvedValue(newSession);
          mockConfigProvider.isProduction.mockReturnValue(false);
        },
        // Invalid session replacement
        async () => {
          const newSession = createMockSessionWithId();
          mockSessionExtractor.extractSessionId.mockReturnValue('invalid');
          mockSessionProvider.get.mockRejectedValue(new Error('Invalid'));
          mockSessionProvider.create.mockResolvedValue(newSession);
          mockConfigProvider.isProduction.mockReturnValue(false);
        },
      ];

      for (const setupTest of testCases) {
        vi.clearAllMocks();
        await setupTest();
        const result = await guard.canActivate(mockExecutionContext);
        expect(result).toBe(true);
      }
    });
  });
});