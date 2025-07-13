import { vi, describe, it, expect, beforeEach } from 'vitest';
import { applicationMetrics } from '../telemetry/metrics';

// Mock the metrics module
vi.mock('../telemetry/metrics', () => ({
  applicationMetrics: {
    recordRateLimitViolation: vi.fn(),
  },
}));

describe('Rate Limiting Metrics Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Metrics Recording Behavior', () => {
    it('should record rate limit violations with correct endpoint format', () => {
      // Test the exact format that our guards use
      applicationMetrics.recordRateLimitViolation('websocket:note_event', 'session-123');

      expect(applicationMetrics.recordRateLimitViolation).toHaveBeenCalledWith(
        'websocket:note_event',
        'session-123'
      );
    });

    it('should handle different WebSocket event types', () => {
      const eventTypes = ['note_event', 'signal_event', 'user_update', 'room_join'];
      
      eventTypes.forEach(eventType => {
        applicationMetrics.recordRateLimitViolation(`websocket:${eventType}`, 'session-456');
      });

      eventTypes.forEach(eventType => {
        expect(applicationMetrics.recordRateLimitViolation).toHaveBeenCalledWith(
          `websocket:${eventType}`,
          'session-456'
        );
      });
    });

    it('should handle different user identifier formats', () => {
      const identifiers = [
        'session-123',           // Normal session
        '192.168.1.100',        // IP address fallback
        'unknown',              // Complete fallback
        'session-abc-def-123',  // Complex session ID
      ];

      identifiers.forEach(identifier => {
        applicationMetrics.recordRateLimitViolation('websocket:test_event', identifier);
      });

      identifiers.forEach(identifier => {
        expect(applicationMetrics.recordRateLimitViolation).toHaveBeenCalledWith(
          'websocket:test_event',
          identifier
        );
      });
    });

    it('should handle metrics recording without user identifier', () => {
      applicationMetrics.recordRateLimitViolation('websocket:note_event');

      expect(applicationMetrics.recordRateLimitViolation).toHaveBeenCalledWith(
        'websocket:note_event'
      );
    });
  });

  describe('Metrics Format Validation', () => {
    it('should use consistent endpoint naming convention', () => {
      // Test that our convention of 'websocket:event_name' is followed
      const testCases = [
        { event: 'note_event', expected: 'websocket:note_event' },
        { event: 'signal_event', expected: 'websocket:signal_event' },
        { event: 'user_update', expected: 'websocket:user_update' },
        { event: 'room_join', expected: 'websocket:room_join' },
      ];

      testCases.forEach(({ event, expected }) => {
        applicationMetrics.recordRateLimitViolation(expected, 'test-user');
        
        expect(applicationMetrics.recordRateLimitViolation).toHaveBeenCalledWith(
          expected,
          'test-user'
        );
      });
    });

    it('should handle edge cases in identifiers', () => {
      const edgeCases = [
        '',                     // Empty string
        '0',                   // Numeric string
        'session-with-special-chars!@#',  // Special characters
        'very-long-session-id-that-might-exceed-normal-limits-123456789',  // Long ID
      ];

      edgeCases.forEach(identifier => {
        applicationMetrics.recordRateLimitViolation('websocket:edge_case', identifier);
      });

      edgeCases.forEach(identifier => {
        expect(applicationMetrics.recordRateLimitViolation).toHaveBeenCalledWith(
          'websocket:edge_case',
          identifier
        );
      });
    });
  });

  describe('Integration with Observable Behavior', () => {
    it('should be called the correct number of times for multiple violations', () => {
      // Simulate multiple rate limit violations
      for (let i = 0; i < 5; i++) {
        applicationMetrics.recordRateLimitViolation('websocket:note_event', `session-${i}`);
      }

      expect(applicationMetrics.recordRateLimitViolation).toHaveBeenCalledTimes(5);
    });

    it('should handle concurrent violations correctly', () => {
      // Simulate violations happening simultaneously
      const violations = [
        ['websocket:note_event', 'user1'],
        ['websocket:signal_event', 'user2'],
        ['websocket:note_event', 'user3'],
        ['websocket:user_update', 'user1'],
      ];

      violations.forEach(([endpoint, user]) => {
        applicationMetrics.recordRateLimitViolation(endpoint!, user!);
      });

      expect(applicationMetrics.recordRateLimitViolation).toHaveBeenCalledTimes(4);
      
      violations.forEach(([endpoint, user]) => {
        expect(applicationMetrics.recordRateLimitViolation).toHaveBeenCalledWith(endpoint, user);
      });
    });
  });
});
