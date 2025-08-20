import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Transport } from '../constants';
import { setConnectionStore } from '../stores/ConnectionStore';
import {
  addPeerConnection,
  removePeerConnection,
  updatePeerTransport,
  updatePeerLatency,
  setMaxLatency,
} from './ConnectionActions';


type PeerConnections = Record<string, { latency: number; transport: Transport }>;
type SetConnections = (connections: PeerConnections) => PeerConnections;

// Mock the store
vi.mock('../stores/ConnectionStore', () => ({
  setConnectionStore: vi.fn(),
  connectionStore: {
    peerConnections: {
      'user-123': { transport: 'websocket', latency: 25 },
      'user-456': { transport: 'webrtc', latency: 50 },
    },
    maxLatency: 0,
  },
}));

describe('ConnectionActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addPeerConnection', () => {
    it('should add peer connection with default values', () => {
      addPeerConnection('user-123');

      expect(setConnectionStore).toHaveBeenCalledWith('peerConnections', 'user-123', {
        latency: 0,
        transport: Transport.WEBSOCKET,
      });
    });

    it('should add peer connection with custom transport and latency', () => {
      addPeerConnection('user-456', Transport.WEBRTC, 50);

      expect(setConnectionStore).toHaveBeenCalledWith('peerConnections', 'user-456', {
        latency: 50,
        transport: Transport.WEBRTC,
      });
    });


    it('should create connection with default WebSocket transport when no transport specified', () => {
      addPeerConnection('user-default');

      expect(setConnectionStore).toHaveBeenCalledWith('peerConnections', 'user-default', {
        latency: 0,
        transport: Transport.WEBSOCKET,
      });
    });
  });

  describe('removePeerConnection', () => {
    it('should remove peer connection by updating state with function', () => {
      removePeerConnection('user-123');

      expect(setConnectionStore).toHaveBeenCalledWith('peerConnections', expect.any(Function));
      
      // Test the function passed to setConnectionStore
      const updateFunction = vi.mocked(setConnectionStore).mock.calls[0][1] as SetConnections;
      const mockConnections = {
        'user-123': { latency: 50, transport: Transport.WEBRTC },
        'user-456': { latency: 25, transport: Transport.WEBSOCKET },
      };

      const result = updateFunction(mockConnections);

      expect(result).toEqual({
        'user-456': { latency: 25, transport: Transport.WEBSOCKET },
      });
      expect(result).not.toHaveProperty('user-123');
    });

    it('should handle removing non-existent user gracefully', () => {
      removePeerConnection('nonexistent-user');

      const updateFunction = vi.mocked(setConnectionStore).mock.calls[0][1] as SetConnections;
      const mockConnections = {
        'user-456': { latency: 25, transport: Transport.WEBSOCKET },
      };

      const result = updateFunction(mockConnections);

      expect(result).toEqual({
        'user-456': { latency: 25, transport: Transport.WEBSOCKET },
      });
    });

    it('should not mutate original connections object', () => {
      removePeerConnection('user-123');

      const updateFunction = vi.mocked(setConnectionStore).mock.calls[0][1] as SetConnections;
      const originalConnections = {
        'user-123': { latency: 50, transport: Transport.WEBRTC },
        'user-456': { latency: 25, transport: Transport.WEBSOCKET },
      };

      const result = updateFunction(originalConnections);

      // Original should be unchanged
      expect(originalConnections).toHaveProperty('user-123');
      // Result should not have the removed user
      expect(result).not.toHaveProperty('user-123');
      // Should be different objects
      expect(result).not.toBe(originalConnections);
    });

    it('should handle empty connections object', () => {
      removePeerConnection('user-123');

      const updateFunction = vi.mocked(setConnectionStore).mock.calls[0][1] as SetConnections;
      const result = updateFunction({});

      expect(result).toEqual({});
    });
  });

  describe('updatePeerTransport', () => {
    it('should update peer transport to WebRTC', () => {
      updatePeerTransport('user-123', Transport.WEBRTC);

      expect(setConnectionStore).toHaveBeenCalledWith(
        'peerConnections',
        'user-123',
        'transport',
        Transport.WEBRTC
      );
    });

    it('should update peer transport to WebSocket', () => {
      updatePeerTransport('user-456', Transport.WEBSOCKET);

      expect(setConnectionStore).toHaveBeenCalledWith(
        'peerConnections',
        'user-456',
        'transport',
        Transport.WEBSOCKET
      );
    });

  });

  describe('updatePeerLatency', () => {
    it('should update peer latency with positive value', () => {
      updatePeerLatency('user-123', 45.67);

      expect(setConnectionStore).toHaveBeenCalledWith(
        'peerConnections',
        'user-123',
        'latency',
        45.67
      );
    });

    it('should update peer latency with zero', () => {
      updatePeerLatency('user-456', 0);

      expect(setConnectionStore).toHaveBeenCalledWith(
        'peerConnections',
        'user-456',
        'latency',
        0
      );
    });

    it('should handle fractional latency values', () => {
      updatePeerLatency('user-123', 123.45);

      expect(setConnectionStore).toHaveBeenCalledWith(
        'peerConnections',
        'user-123',
        'latency',
        123.45
      );
    });

    it('should not update latency for non-existent peer', () => {
      updatePeerLatency('non-existent-user', 50);

      expect(setConnectionStore).not.toHaveBeenCalled();
    });

  });

  describe('setMaxLatency', () => {
    it('should set max latency with positive value', () => {
      setMaxLatency(100);

      expect(setConnectionStore).toHaveBeenCalledWith('maxLatency', 100);
    });

    it('should set max latency to zero', () => {
      setMaxLatency(0);

      expect(setConnectionStore).toHaveBeenCalledWith('maxLatency', 0);
    });

    it('should accept high precision latency values', () => {
      setMaxLatency(67.89123);

      expect(setConnectionStore).toHaveBeenCalledWith('maxLatency', 67.89123);
    });

  });

  describe('integration scenarios', () => {
    it('should handle complete peer lifecycle', () => {
      // Add peer
      addPeerConnection('user-123', Transport.WEBSOCKET, 0);
      
      // Update transport to WebRTC
      updatePeerTransport('user-123', Transport.WEBRTC);
      
      // Update latency as it gets measured
      updatePeerLatency('user-123', 45.5);
      
      // Remove peer when they leave
      removePeerConnection('user-123');

      
      // Verify each call
      expect(setConnectionStore).toHaveBeenNthCalledWith(1, 'peerConnections', 'user-123', {
        latency: 0,
        transport: Transport.WEBSOCKET,
      });
      expect(setConnectionStore).toHaveBeenNthCalledWith(2, 'peerConnections', 'user-123', 'transport', Transport.WEBRTC);
      expect(setConnectionStore).toHaveBeenNthCalledWith(3, 'peerConnections', 'user-123', 'latency', 45.5);
      expect(setConnectionStore).toHaveBeenNthCalledWith(4, 'peerConnections', expect.any(Function));
    });

    it('should maintain separate state for different peers', () => {
      // Add peers with different initial states
      addPeerConnection('websocket-user', Transport.WEBSOCKET, 25);
      addPeerConnection('webrtc-user', Transport.WEBRTC, 50);
      
      // Verify each peer gets their own connection object
      expect(setConnectionStore).toHaveBeenCalledWith('peerConnections', 'websocket-user', {
        latency: 25,
        transport: Transport.WEBSOCKET,
      });
      expect(setConnectionStore).toHaveBeenCalledWith('peerConnections', 'webrtc-user', {
        latency: 50,
        transport: Transport.WEBRTC,
      });
    });

    it('should handle peer connection cleanup correctly', () => {
      addPeerConnection('temp-user');
      
      removePeerConnection('temp-user');
      
      // Verify the removal function behavior
      const updateFunction = vi.mocked(setConnectionStore).mock.calls
        .find(call => typeof call[1] === 'function')?.[1] as SetConnections;
      
      const mockConnections = {
        'temp-user': { latency: 50, transport: Transport.WEBRTC },
        'permanent-user': { latency: 25, transport: Transport.WEBSOCKET },
      };

      const result = updateFunction(mockConnections);
      expect(result).not.toHaveProperty('temp-user');
      expect(result).toHaveProperty('permanent-user');
    });
  });
});
