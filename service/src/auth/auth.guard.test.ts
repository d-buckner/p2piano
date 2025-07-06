import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { vi } from 'vitest';
import { SessionValidatorService } from '../services/session-validator.service';
import { 
  createMockHttpExecutionContext
} from '../test-utils/validation.helpers';
import { AuthGuard } from './auth.guard';

// Mock SessionValidatorService
vi.mock('../services/session-validator.service');

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let sessionValidatorService: SessionValidatorService;

  beforeEach(async () => {
    const mockSessionValidatorService = {
      validateAndAttachToRequest: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: AuthGuard,
          useFactory: () => new AuthGuard(mockSessionValidatorService as any),
        },
        {
          provide: SessionValidatorService,
          useValue: mockSessionValidatorService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    sessionValidatorService = module.get<SessionValidatorService>(SessionValidatorService);

    vi.clearAllMocks();
  });

  describe('valid sessions', () => {
    it('should allow access when session validation succeeds', async () => {
      const mockExecutionContext = createMockHttpExecutionContext();
      
      (sessionValidatorService.validateAndAttachToRequest as any).mockResolvedValue(true);

      const result = await guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
      expect(sessionValidatorService.validateAndAttachToRequest).toHaveBeenCalledWith(
        expect.any(Object)
      );
    });

    it('should call validateAndAttachToRequest with correct request object', async () => {
      const mockRequest = { ip: '192.168.1.1', headers: {}, cookies: {} };
      const mockExecutionContext = createMockHttpExecutionContext(mockRequest);
      
      (sessionValidatorService.validateAndAttachToRequest as any).mockResolvedValue(true);

      await guard.canActivate(mockExecutionContext as any);

      expect(sessionValidatorService.validateAndAttachToRequest).toHaveBeenCalledWith(
        expect.objectContaining(mockRequest)
      );
    });
  });

  describe('invalid sessions', () => {
    it('should throw UnauthorizedException when session validation fails', async () => {
      const mockExecutionContext = createMockHttpExecutionContext();
      
      (sessionValidatorService.validateAndAttachToRequest as any).mockResolvedValue(false);

      await expect(guard.canActivate(mockExecutionContext as any))
        .rejects.toThrow(new UnauthorizedException('Session required'));
      
      expect(sessionValidatorService.validateAndAttachToRequest).toHaveBeenCalledWith(
        expect.any(Object)
      );
    });

    it('should throw UnauthorizedException when session validator throws error', async () => {
      const mockExecutionContext = createMockHttpExecutionContext();
      
      (sessionValidatorService.validateAndAttachToRequest as any).mockRejectedValue(
        new Error('Validation failed')
      );

      await expect(guard.canActivate(mockExecutionContext as any))
        .rejects.toThrow(new UnauthorizedException('Session required'));
    });

    it('should handle various request types', async () => {
      const testCases = [
        { ip: '192.168.1.1', headers: { authorization: 'Bearer invalid' } },
        { ip: '10.0.0.1', cookies: { sessionId: 'invalid' } },
        { ip: '127.0.0.1', headers: {}, cookies: {} },
      ];

      for (const testCase of testCases) {
        const mockExecutionContext = createMockHttpExecutionContext(testCase);
        
        (sessionValidatorService.validateAndAttachToRequest as any).mockResolvedValue(false);

        await expect(guard.canActivate(mockExecutionContext as any))
          .rejects.toThrow(new UnauthorizedException('Session required'));
        
        expect(sessionValidatorService.validateAndAttachToRequest).toHaveBeenCalledWith(
          expect.objectContaining(testCase)
        );
        
        vi.clearAllMocks();
      }
    });
  });

  describe('integration with SessionValidatorService', () => {
    it('should delegate all validation logic to SessionValidatorService', async () => {
      const mockExecutionContext = createMockHttpExecutionContext();
      
      (sessionValidatorService.validateAndAttachToRequest as any).mockResolvedValue(true);

      await guard.canActivate(mockExecutionContext as any);

      expect(sessionValidatorService.validateAndAttachToRequest).toHaveBeenCalledTimes(1);
    });

    it('should pass the correct request object to SessionValidatorService', async () => {
      const mockRequest = { 
        ip: '192.168.1.100', 
        headers: { authorization: 'Bearer test-token' },
        cookies: { sessionId: 'test-session' }
      };
      const mockExecutionContext = createMockHttpExecutionContext(mockRequest);
      
      (sessionValidatorService.validateAndAttachToRequest as any).mockResolvedValue(true);

      await guard.canActivate(mockExecutionContext as any);

      expect(sessionValidatorService.validateAndAttachToRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          ip: '192.168.1.100',
          headers: expect.objectContaining({ authorization: 'Bearer test-token' }),
          cookies: expect.objectContaining({ sessionId: 'test-session' })
        })
      );
    });
  });
});
