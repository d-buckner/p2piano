import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setStore } from '../app/store';
import { Transport } from '../constants';
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
vi.mock('../app/store', () => ({
  setStore: vi.fn(),
  store: {},
}));

describe('ConnectionActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addPeerConnection', () => {
    it('should add peer connection with default values', () => {
      addPeerConnection('user-123');

      expect(setStore).toHaveBeenCalledWith('connection', 'peerConnections', 'user-123', {
        latency: 0,
        transport: Transport.WEBSOCKET,
      });
    });

    it('should add peer connection with custom transport and latency', () => {
      addPeerConnection('user-456', Transport.WEBRTC, 50);

      expect(setStore).toHaveBeenCalledWith('connection', 'peerConnections', 'user-456', {
        latency: 50,
        transport: Transport.WEBRTC,
      });
    });


    it('should create connection with default WebSocket transport when no transport specified', () => {
      addPeerConnection('user-default');

      expect(setStore).toHaveBeenCalledWith('connection', 'peerConnections', 'user-default', {
        latency: 0,
        transport: Transport.WEBSOCKET,
      });
    });
  });

  describe('removePeerConnection', () => {
    it('should remove peer connection by updating state with function', () => {
      removePeerConnection('user-123');

      expect(setStore).toHaveBeenCalledWith('connection', 'peerConnections', expect.any(Function));
      
      // Test the function passed to setStore
      const updateFunction = vi.mocked(setStore).mock.calls[0][2] as SetConnections;
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

      const updateFunction = vi.mocked(setStore).mock.calls[0][2] as SetConnections;
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

      const updateFunction = vi.mocked(setStore).mock.calls[0][2] as SetConnections;
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

      const updateFunction = vi.mocked(setStore).mock.calls[0][2] as SetConnections;
      const result = updateFunction({});

      expect(result).toEqual({});
    });
  });

  describe('updatePeerTransport', () => {
    it('should update peer transport to WebRTC', () => {
      updatePeerTransport('user-123', Transport.WEBRTC);

      expect(setStore).toHaveBeenCalledWith(
        'connection',
        'peerConnections',
        'user-123',
        'transport',
        Transport.WEBRTC
      );
    });

    it('should update peer transport to WebSocket', () => {
      updatePeerTransport('user-456', Transport.WEBSOCKET);

      expect(setStore).toHaveBeenCalledWith(
        'connection',
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

      expect(setStore).toHaveBeenCalledWith(
        'connection',
        'peerConnections',
        'user-123',
        'latency',
        45.67
      );
    });

    it('should update peer latency with zero', () => {
      updatePeerLatency('user-456', 0);

      expect(setStore).toHaveBeenCalledWith(
        'connection',
        'peerConnections',
        'user-456',
        'latency',
        0
      );
    });

    it('should handle fractional latency values', () => {
      updatePeerLatency('user-789', 123.45);

      expect(setStore).toHaveBeenCalledWith(
        'connection',
        'peerConnections',
        'user-789',
        'latency',
        123.45
      );
    });

  });

  describe('setMaxLatency', () => {
    it('should set max latency with positive value', () => {
      setMaxLatency(100);

      expect(setStore).toHaveBeenCalledWith('connection', 'maxLatency', 100);
    });

    it('should set max latency to zero', () => {
      setMaxLatency(0);

      expect(setStore).toHaveBeenCalledWith('connection', 'maxLatency', 0);
    });

    it('should accept high precision latency values', () => {
      setMaxLatency(67.89123);

      expect(setStore).toHaveBeenCalledWith('connection', 'maxLatency', 67.89123);
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
      expect(setStore).toHaveBeenNthCalledWith(1, 'connection', 'peerConnections', 'user-123', {
        latency: 0,
        transport: Transport.WEBSOCKET,
      });
      expect(setStore).toHaveBeenNthCalledWith(2, 'connection', 'peerConnections', 'user-123', 'transport', Transport.WEBRTC);
      expect(setStore).toHaveBeenNthCalledWith(3, 'connection', 'peerConnections', 'user-123', 'latency', 45.5);
      expect(setStore).toHaveBeenNthCalledWith(4, 'connection', 'peerConnections', expect.any(Function));
    });

    it('should maintain separate state for different peers', () => {
      // Add peers with different initial states
      addPeerConnection('websocket-user', Transport.WEBSOCKET, 25);
      addPeerConnection('webrtc-user', Transport.WEBRTC, 50);
      
      // Verify each peer gets their own connection object
      expect(setStore).toHaveBeenCalledWith('connection', 'peerConnections', 'websocket-user', {
        latency: 25,
        transport: Transport.WEBSOCKET,
      });
      expect(setStore).toHaveBeenCalledWith('connection', 'peerConnections', 'webrtc-user', {
        latency: 50,
        transport: Transport.WEBRTC,
      });
    });

    it('should handle peer connection cleanup correctly', () => {
      addPeerConnection('temp-user');
      
      removePeerConnection('temp-user');
      
      // Verify the removal function behavior
      const updateFunction = vi.mocked(setStore).mock.calls
        .find(call => typeof call[2] === 'function')?.[2] as SetConnections;
      
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