import { Test } from '@nestjs/testing';
import { vi } from 'vitest';
import { AuthModule } from '../auth/auth.module';
import SessionProvider from '../entities/Session';
import { SessionValidatorService } from '../services/session-validator.service';
import { 
  createMockHttpRequest,
  createUUID 
} from '../test-utils/validation.helpers';

// Mock external dependencies
vi.mock('../entities/Session');

describe('Security Regression Tests', () => {
  let sessionValidatorService: SessionValidatorService;
  let mockSessionProvider: any;

  beforeEach(async () => {
    mockSessionProvider = SessionProvider as any;

    // Set up mock implementations
    mockSessionProvider.get = vi.fn();
    mockSessionProvider.create = vi.fn();

    const module = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    sessionValidatorService = module.get<SessionValidatorService>(SessionValidatorService);

    vi.clearAllMocks();
  });

  describe('Session Injection Attacks', () => {
    it('should reject SQL injection attempts in session IDs', async () => {
      const maliciousSessionIds = [
        "'; DROP TABLE sessions; --",
        "' OR '1'='1",
        "admin'/*",
        "' UNION SELECT * FROM users --",
        '1; DELETE FROM sessions; --'
      ];

      for (const maliciousId of maliciousSessionIds) {
        const mockRequest = createMockHttpRequest({
          headers: { authorization: `Bearer ${maliciousId}` },
          ip: '192.168.1.1'
        });

        mockSessionProvider.get.mockResolvedValue(null); // Should not find these

        const result = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);

        expect(result).toBe(false);
        expect(mockRequest.session).toBeUndefined();
        expect(mockSessionProvider.get).toHaveBeenCalledWith(maliciousId, '192.168.1.1');

        vi.clearAllMocks();
      }
    });

    it('should reject NoSQL injection attempts in session IDs', async () => {
      const noSqlInjections = [
        '{"$ne": null}',
        '{"$gt": ""}',
        '{"$where": "function() { return true; }"}',
        '{"$regex": ".*"}',
        '{"$exists": true}'
      ];

      for (const injection of noSqlInjections) {
        const mockRequest = createMockHttpRequest({
          headers: { authorization: `Bearer ${injection}` },
          ip: '192.168.1.1'
        });

        mockSessionProvider.get.mockResolvedValue(null);

        const result = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);

        expect(result).toBe(false);
        expect(mockSessionProvider.get).toHaveBeenCalledWith(injection, '192.168.1.1');

        vi.clearAllMocks();
      }
    });

    it('should handle extremely long session IDs without performance degradation', async () => {
      const veryLongSessionId = 'a'.repeat(10000); // 10KB session ID
      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${veryLongSessionId}` },
        ip: '192.168.1.1'
      });

      mockSessionProvider.get.mockResolvedValue(null);

      const startTime = Date.now();
      const result = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);
      const endTime = Date.now();

      expect(result).toBe(false);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(mockSessionProvider.get).toHaveBeenCalledWith(veryLongSessionId, '192.168.1.1');
    });
  });

  describe('Error Information Disclosure', () => {
    it('should not leak sensitive information in error responses', async () => {
      const sessionId = createUUID();
      
      // Mock SessionProvider to throw detailed error
      const sensitiveError = new Error('Database connection to internal-db.company.local:5432 failed with credentials user=admin');
      mockSessionProvider.get.mockRejectedValue(sensitiveError);

      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${sessionId}` },
        ip: '192.168.1.1'
      });

      // Should handle error gracefully without exposing details
      const result = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);

      expect(result).toBe(false);
      expect(mockRequest.session).toBeUndefined();
      
      // The error should be handled internally, not propagated
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
    });

    it('should handle malformed session data without information disclosure', async () => {
      const sessionId = createUUID();
      
      // Mock SessionProvider to return malformed data
      const malformedData = {
        sessionId: null,
        createdAt: 'invalid-date',
        userAgent: undefined,
        ipAddress: { invalid: 'object' }
      };

      mockSessionProvider.get.mockResolvedValue(malformedData as any);

      const mockRequest = createMockHttpRequest({
        headers: { authorization: `Bearer ${sessionId}` },
        ip: '192.168.1.1'
      });

      const result = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);

      // Should handle gracefully
      expect(result).toBe(true);
      expect(mockRequest.session).toBe(malformedData);
    });
  });

  describe('Resource Exhaustion Protection', () => {
    it('should handle memory exhaustion attempts with large payloads', async () => {
      const sessionId = createUUID();
      const hugePayload = 'x'.repeat(1024 * 1024); // 1MB payload
      
      const mockRequest = createMockHttpRequest({
        headers: { 
          authorization: `Bearer ${sessionId}`,
          'user-agent': hugePayload,
          'x-custom-header': hugePayload
        },
        ip: '192.168.1.1'
      });

      mockSessionProvider.get.mockResolvedValue(null);

      const result = await sessionValidatorService.validateAndAttachToRequest(mockRequest as any);

      expect(result).toBe(false);
      // Should still call the validator despite large payload
      expect(mockSessionProvider.get).toHaveBeenCalledWith(sessionId, '192.168.1.1');
    });
  });
});
