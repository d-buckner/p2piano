import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import SessionProvider from '../entities/Session';

// Mock SessionProvider
jest.mock('../entities/Session');

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: any;
  let mockSessionProvider: jest.Mocked<typeof SessionProvider>;

  beforeEach(() => {
    mockSessionProvider = SessionProvider as jest.Mocked<typeof SessionProvider>;
    guard = new AuthGuard();
    mockRequest = {
      headers: {},
      cookies: {},
      query: {},
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
      }),
    } as any;

    jest.clearAllMocks();
  });

  describe('valid sessions', () => {
    it('should allow access with valid session in Authorization header', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = { sessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockRequest.headers.authorization = `Bearer ${sessionId}`;
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
      expect(mockRequest.session).toBe(mockSession);
    });

    it('should allow access with valid session in cookie', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = { sessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockRequest.cookies.sessionId = sessionId;
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
      expect(mockRequest.session).toBe(mockSession);
    });

    it('should allow access with valid session in query parameter', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = { sessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockRequest.query.sessionId = sessionId;
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
      expect(mockRequest.session).toBe(mockSession);
    });

    it('should prioritize Authorization header over other methods', async () => {
      const headerSessionId = '550e8400-e29b-41d4-a716-446655440000';
      const cookieSessionId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      const mockSession = { sessionId: headerSessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockRequest.headers.authorization = `Bearer ${headerSessionId}`;
      mockRequest.cookies.sessionId = cookieSessionId;
      mockSessionProvider.get.mockResolvedValue(mockSession);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(SessionProvider.get).toHaveBeenCalledWith(headerSessionId);
      expect(mockSessionProvider.get).not.toHaveBeenCalledWith(cookieSessionId);
    });
  });

  describe('invalid sessions', () => {
    it('should throw UnauthorizedException when no session provided', async () => {
      await expect(guard.canActivate(mockExecutionContext))
        .rejects.toThrow(new UnauthorizedException('Session required'));
      
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when session does not exist', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockRequest.headers.authorization = `Bearer ${sessionId}`;
      mockSessionProvider.get.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext))
        .rejects.toThrow(new UnauthorizedException('Invalid session'));
      
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
    });

    it('should throw UnauthorizedException when SessionProvider throws error', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      
      mockRequest.headers.authorization = `Bearer ${sessionId}`;
      mockSessionProvider.get.mockRejectedValue(new Error('Session not found'));

      await expect(guard.canActivate(mockExecutionContext))
        .rejects.toThrow(new UnauthorizedException('Invalid session'));
      
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
    });

    it('should throw UnauthorizedException for malformed Authorization header', async () => {
      mockRequest.headers.authorization = 'Invalid format';

      await expect(guard.canActivate(mockExecutionContext))
        .rejects.toThrow(new UnauthorizedException('Session required'));
      
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for Authorization header without Bearer prefix', async () => {
      mockRequest.headers.authorization = '550e8400-e29b-41d4-a716-446655440000';

      await expect(guard.canActivate(mockExecutionContext))
        .rejects.toThrow(new UnauthorizedException('Session required'));
      
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for empty sessionId', async () => {
      mockRequest.headers.authorization = 'Bearer ';

      await expect(guard.canActivate(mockExecutionContext))
        .rejects.toThrow(new UnauthorizedException('Session required'));
      
      expect(mockSessionProvider.get).not.toHaveBeenCalled();
    });
  });

  describe('session extraction', () => {
    it('should extract session from Authorization header correctly', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = { sessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockRequest.headers.authorization = `Bearer ${sessionId}`;
      mockSessionProvider.get.mockResolvedValue(mockSession);

      await guard.canActivate(mockExecutionContext);

      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
    });

    it('should fallback to cookie when Authorization header is missing', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = { sessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockRequest.cookies.sessionId = sessionId;
      mockSessionProvider.get.mockResolvedValue(mockSession);

      await guard.canActivate(mockExecutionContext);

      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
    });

    it('should fallback to query parameter when Authorization header and cookie are missing', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = { sessionId, createdAt: new Date(), lastActivity: new Date() };
      
      mockRequest.query.sessionId = sessionId;
      mockSessionProvider.get.mockResolvedValue(mockSession);

      await guard.canActivate(mockExecutionContext);

      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId);
    });
  });
});