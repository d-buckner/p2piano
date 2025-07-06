import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Import after mocks
import RealTimeController from './RealTimeController';

// Simple mocks defined in beforeEach to avoid hoisting issues
let mockWebsocketInstance: {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  sendToPeer: ReturnType<typeof vi.fn>;
  sendToPeers: ReturnType<typeof vi.fn>;
};
let mockWebrtcInstance: {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  sendToPeer: ReturnType<typeof vi.fn>;
  sendToPeers: ReturnType<typeof vi.fn>;
};

// Mock the modules with factory functions
vi.mock('./transports/WebsocketController', () => ({
  default: {
    getInstance: () => mockWebsocketInstance,
  },
}));

vi.mock('./transports/WebRtcController', () => ({
  default: {
    getInstance: () => mockWebrtcInstance,
  },
}));

vi.mock('../app/store', () => ({
  store: {},
}));

vi.mock('../selectors/connectionSelectors', () => ({
  selectConnectedPeerIds: vi.fn(() => ['user1', 'user2']),
  selectPeerConnection: vi.fn((peerId: string) => () => ({
    transport: peerId === 'user1' ? 'WEBRTC' : 'WEBSOCKET'
  })),
}));

vi.mock('../lib/Logger', () => ({
  default: { ERROR: vi.fn(), WARN: vi.fn() },
}));

describe('RealTimeController', () => {
  beforeEach(() => {
    mockWebsocketInstance = {
      on: vi.fn(),
      off: vi.fn(),
      sendToPeer: vi.fn(),
      sendToPeers: vi.fn(),
    };
    
    mockWebrtcInstance = {
      on: vi.fn(),
      off: vi.fn(),
      sendToPeer: vi.fn(),
      sendToPeers: vi.fn(),
    };
    
    (RealTimeController as unknown as { instance: undefined }).instance = undefined;
  });

  afterEach(() => {
    RealTimeController.destroy();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = RealTimeController.getInstance();
      const instance2 = RealTimeController.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('event handler management', () => {
    it('should register handlers on both transports', () => {
      const controller = RealTimeController.getInstance();
      const handler = vi.fn();
      
      controller.on('KEY_DOWN', handler);
      
      expect(mockWebrtcInstance.on).toHaveBeenCalledWith('KEY_DOWN', handler);
      expect(mockWebsocketInstance.on).toHaveBeenCalledWith('KEY_DOWN', handler);
    });

    it('should unregister handlers from both transports', () => {
      const controller = RealTimeController.getInstance();
      const handler = vi.fn();
      
      controller.off('KEY_UP', handler);
      
      expect(mockWebrtcInstance.off).toHaveBeenCalledWith('KEY_UP', handler);
      expect(mockWebsocketInstance.off).toHaveBeenCalledWith('KEY_UP', handler);
    });
  });

  describe('messaging', () => {
    it('should send to WebRTC peer', () => {
      const controller = RealTimeController.getInstance();
      
      controller.sendToPeer('user1', 'KEY_DOWN', { midi: 60 });
      
      expect(mockWebrtcInstance.sendToPeer).toHaveBeenCalledWith('user1', 'KEY_DOWN', { midi: 60 });
    });

    it('should send to WebSocket peer', () => {
      const controller = RealTimeController.getInstance();
      
      controller.sendToPeer('user2', 'KEY_DOWN', { midi: 60 });
      
      expect(mockWebsocketInstance.sendToPeer).toHaveBeenCalledWith('user2', 'KEY_DOWN', { midi: 60 });
    });

    it('should fallback to WebSocket when WebRTC fails', () => {
      const controller = RealTimeController.getInstance();
      
      mockWebrtcInstance.sendToPeer.mockImplementation(() => {
        throw new Error('WebRTC failed');
      });
      
      controller.sendToPeer('user1', 'KEY_DOWN', { midi: 60 });
      
      expect(mockWebrtcInstance.sendToPeer).toHaveBeenCalled();
      expect(mockWebsocketInstance.sendToPeer).toHaveBeenCalledWith('user1', 'KEY_DOWN', { midi: 60 });
    });

    it('should broadcast to connected peers', () => {
      const controller = RealTimeController.getInstance();
      
      controller.broadcast('KEY_DOWN', { midi: 60 });
      
      expect(mockWebrtcInstance.sendToPeer).toHaveBeenCalledWith('user1', 'KEY_DOWN', { midi: 60 });
      expect(mockWebsocketInstance.sendToPeers).toHaveBeenCalledWith(['user2'], 'KEY_DOWN', { midi: 60 });
    });
  });

  describe('cleanup', () => {
    it('should destroy singleton instance', () => {
      const instance1 = RealTimeController.getInstance();
      RealTimeController.destroy();
      const instance2 = RealTimeController.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });
  });
});
