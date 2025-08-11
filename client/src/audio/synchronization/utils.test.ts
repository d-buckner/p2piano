import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MIN_LATENCY_CUTOFF_MS } from './constants';
import { getAudioDelay } from './utils';

// Mock the store and selectors
const mockSelectWorkspace = vi.hoisted(() => vi.fn());
const mockSelectMaxLatency = vi.hoisted(() => vi.fn());
const mockSelectPeerConnections = vi.hoisted(() => vi.fn());

vi.mock('../../app/store', () => ({
  store: {},
}));

vi.mock('../../selectors/connectionSelectors', () => ({
  selectMaxLatency: mockSelectMaxLatency,
  selectPeerConnections: mockSelectPeerConnections,
}));

vi.mock('../../selectors/workspaceSelectors', () => ({
  selectWorkspace: mockSelectWorkspace,
}));

interface MockWorkspace {
  userId: string;
}

interface MockPeerConnection {
  latency: number;
}

interface MockPeerConnections {
  [userId: string]: MockPeerConnection;
}

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAudioDelay', () => {
    it('should return maxLatency for current user', () => {
      const currentUserId = 'current-user';
      const maxLatency = 100;
      const mockWorkspace: MockWorkspace = { userId: currentUserId };
      
      mockSelectWorkspace.mockReturnValue(mockWorkspace);
      mockSelectMaxLatency.mockReturnValue(maxLatency);

      const result = getAudioDelay(currentUserId);

      expect(result).toBe(maxLatency);
      expect(mockSelectWorkspace).toHaveBeenCalledTimes(1);
      expect(mockSelectMaxLatency).toHaveBeenCalledTimes(1);
    });

    it('should calculate delay for other users', () => {
      const currentUserId = 'current-user';
      const otherUserId = 'other-user';
      const maxLatency = 150;
      const peerLatency = 50;
      const expectedDelay = maxLatency - peerLatency;
      
      const mockWorkspace: MockWorkspace = { userId: currentUserId };
      const mockPeerConnections: MockPeerConnections = {
        [otherUserId]: { latency: peerLatency }
      };
      
      mockSelectWorkspace.mockReturnValue(mockWorkspace);
      mockSelectMaxLatency.mockReturnValue(maxLatency);
      mockSelectPeerConnections.mockReturnValue(mockPeerConnections);

      const result = getAudioDelay(otherUserId);

      expect(result).toBe(expectedDelay);
      expect(mockSelectPeerConnections).toHaveBeenCalledTimes(1);
    });

    it('should return undefined for delays below minimum cutoff', () => {
      const currentUserId = 'current-user';
      const otherUserId = 'other-user';
      const maxLatency = 100;
      const peerLatency = 95; // This would result in 5ms delay, below cutoff
      
      const mockWorkspace: MockWorkspace = { userId: currentUserId };
      const mockPeerConnections: MockPeerConnections = {
        [otherUserId]: { latency: peerLatency }
      };
      
      mockSelectWorkspace.mockReturnValue(mockWorkspace);
      mockSelectMaxLatency.mockReturnValue(maxLatency);
      mockSelectPeerConnections.mockReturnValue(mockPeerConnections);

      const result = getAudioDelay(otherUserId);

      expect(result).toBeUndefined();
    });

    it('should handle missing peer connection', () => {
      const currentUserId = 'current-user';
      const unknownUserId = 'unknown-user';
      const maxLatency = 100;
      
      const mockWorkspace: MockWorkspace = { userId: currentUserId };
      const mockPeerConnections: MockPeerConnections = {};
      
      mockSelectWorkspace.mockReturnValue(mockWorkspace);
      mockSelectMaxLatency.mockReturnValue(maxLatency);
      mockSelectPeerConnections.mockReturnValue(mockPeerConnections);

      const result = getAudioDelay(unknownUserId);

      expect(result).toBe(maxLatency); // 100 - 0 = 100, which is above cutoff
    });

    it('should use zero latency when peer connection has no latency property', () => {
      const currentUserId = 'current-user';
      const otherUserId = 'other-user';
      const maxLatency = 100;
      
      const mockWorkspace: MockWorkspace = { userId: currentUserId };
      const mockPeerConnections: MockPeerConnections = {
        [otherUserId]: {} as MockPeerConnection // No latency property
      };
      
      mockSelectWorkspace.mockReturnValue(mockWorkspace);
      mockSelectMaxLatency.mockReturnValue(maxLatency);
      mockSelectPeerConnections.mockReturnValue(mockPeerConnections);

      const result = getAudioDelay(otherUserId);

      expect(result).toBe(maxLatency); // 100 - 0 = 100
    });

    it('should return delay exactly at minimum cutoff threshold', () => {
      const currentUserId = 'current-user';
      const otherUserId = 'other-user';
      const maxLatency = 100;
      const peerLatency = maxLatency - MIN_LATENCY_CUTOFF_MS; // Exactly at threshold
      
      const mockWorkspace: MockWorkspace = { userId: currentUserId };
      const mockPeerConnections: MockPeerConnections = {
        [otherUserId]: { latency: peerLatency }
      };
      
      mockSelectWorkspace.mockReturnValue(mockWorkspace);
      mockSelectMaxLatency.mockReturnValue(maxLatency);
      mockSelectPeerConnections.mockReturnValue(mockPeerConnections);

      const result = getAudioDelay(otherUserId);

      expect(result).toBe(MIN_LATENCY_CUTOFF_MS);
    });

    it('should handle negative delays', () => {
      const currentUserId = 'current-user';
      const otherUserId = 'other-user';
      const maxLatency = 50;
      const peerLatency = 100; // Higher than max, results in negative delay
      
      const mockWorkspace: MockWorkspace = { userId: currentUserId };
      const mockPeerConnections: MockPeerConnections = {
        [otherUserId]: { latency: peerLatency }
      };
      
      mockSelectWorkspace.mockReturnValue(mockWorkspace);
      mockSelectMaxLatency.mockReturnValue(maxLatency);
      mockSelectPeerConnections.mockReturnValue(mockPeerConnections);

      const result = getAudioDelay(otherUserId);

      expect(result).toBeUndefined(); // Negative delay is below cutoff
    });

    it('should handle zero max latency', () => {
      const currentUserId = 'current-user';
      const maxLatency = 0;
      
      const mockWorkspace: MockWorkspace = { userId: currentUserId };
      
      mockSelectWorkspace.mockReturnValue(mockWorkspace);
      mockSelectMaxLatency.mockReturnValue(maxLatency);

      const result = getAudioDelay(currentUserId);

      expect(result).toBe(0);
    });
  });
});
