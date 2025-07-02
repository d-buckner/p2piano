import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import SessionProvider from '../entities/Session';
import { SessionExtractor } from '../utils/session-extractor';
import { AuthenticationError } from '../errors';
import { 
  createMockSessionWithId, 
  createUUID
} from '../test-utils/validation.helpers';

import { vi } from 'vitest';

// Mock SessionProvider and SessionExtractor
vi.mock('../entities/Session');
vi.mock('../utils/session-extractor');

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockExecutionContext: any;
  let mockRequest: any;
  let mockSessionProvider: any;
  let mockSessionExtractor: any;

  beforeEach(() => {
    mockSessionProvider = SessionProvider as any;
    mockSessionExtractor = SessionExtractor as any;
    
    // Set up mock implementations
    mockSessionProvider.get = vi.fn();
    mockSessionExtractor.extractSessionId = vi.fn();
    
    guard = new AuthGuard();
    mockRequest = {
      headers: {},
      cookies: {},
      ip: '192.168.1.1',
    };

    mockExecutionContext = {
      switchToHttp: vi.fn(() => ({
        getRequest: () => mockRequest,
      })),
    } as any;

    vi.clearAllMocks();
  });

  describe('valid sessions', () => {
    it('should allow access with valid session in Authorization header', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      
      mockSessionExtractor.extractSessionId.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionExtractor.extractSessionId).toHaveBeenCalledWith(mockRequest);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, mockRequest.ip);
      expect(mockRequest.session).toBe(mockSession);
    });

    it('should allow access with valid session in cookie', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      
      mockSessionExtractor.extractSessionId.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionExtractor.extractSessionId).toHaveBeenCalledWith(mockRequest);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, mockRequest.ip);
      expect(mockRequest.session).toBe(mockSession);
    });


    it('should prioritize Authorization header over other methods', async () => {
      const headerSessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId: headerSessionId });
      
      mockSessionExtractor.extractSessionId.mockReturnValue(headerSessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionExtractor.extractSessionId).toHaveBeenCalledWith(mockRequest);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(headerSessionId, mockRequest.ip);
    });
  });

  describe('invalid sessions', () => {
    it('should throw UnauthorizedException when no session provided', async () => {
      await expect(guard.canActivate(mockExecutionContext))
        .rejects.toThrow(new UnauthorizedException('Session required'));
      
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationError when session does not exist', async () => {
      const sessionId = createUUID();
      
      mockSessionExtractor.extractSessionId.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext))
        .rejects.toThrow(AuthenticationError);
      
      expect(mockSessionExtractor.extractSessionId).toHaveBeenCalledWith(mockRequest);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, mockRequest.ip);
    });

    it('should throw AuthenticationError when SessionProvider throws error', async () => {
      const sessionId = createUUID();
      
      mockSessionExtractor.extractSessionId.mockReturnValue(sessionId);
      mockSessionProvider.get.mockRejectedValue(new Error('Session not found'));

      await expect(guard.canActivate(mockExecutionContext))
        .rejects.toThrow(AuthenticationError);
      
      expect(mockSessionExtractor.extractSessionId).toHaveBeenCalledWith(mockRequest);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, mockRequest.ip);
    });

    it('should throw UnauthorizedException for malformed Authorization header', async () => {
      mockSessionExtractor.extractSessionId.mockReturnValue(null);

      await expect(guard.canActivate(mockExecutionContext))
        .rejects.toThrow(new UnauthorizedException('Session required'));
      
      expect(mockSessionExtractor.extractSessionId).toHaveBeenCalledWith(mockRequest);
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for Authorization header without Bearer prefix', async () => {
      mockSessionExtractor.extractSessionId.mockReturnValue(null);

      await expect(guard.canActivate(mockExecutionContext))
        .rejects.toThrow(new UnauthorizedException('Session required'));
      
      expect(mockSessionExtractor.extractSessionId).toHaveBeenCalledWith(mockRequest);
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for empty sessionId', async () => {
      mockSessionExtractor.extractSessionId.mockReturnValue('');

      await expect(guard.canActivate(mockExecutionContext))
        .rejects.toThrow(new UnauthorizedException('Session required'));
      
      expect(mockSessionExtractor.extractSessionId).toHaveBeenCalledWith(mockRequest);
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });
  });

  describe('session extraction', () => {
    it('should extract session from Authorization header correctly', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      
      mockSessionExtractor.extractSessionId.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      await guard.canActivate(mockExecutionContext);

      expect(mockSessionExtractor.extractSessionId).toHaveBeenCalledWith(mockRequest);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, mockRequest.ip);
    });

    it('should fallback to cookie when Authorization header is missing', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      
      mockSessionExtractor.extractSessionId.mockReturnValue(sessionId);
      mockSessionProvider.get.mockResolvedValue(mockSession);

      await guard.canActivate(mockExecutionContext);

      expect(mockSessionExtractor.extractSessionId).toHaveBeenCalledWith(mockRequest);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, mockRequest.ip);
    });

  });
});