import SimplePeer from 'simple-peer';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Import after mocks
import { updatePeerTransport } from '../../actions/ConnectionActions';
import { Transport } from '../../constants';
import WebRtcController, { ACTION } from './WebRtcController';


type EventHandler = (...args: unknown[]) => void;

// Mock instances to be set in beforeEach
let mockPeerInstance: {
  on: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  signal: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
};
let mockWebsocketInstance: {
  on: ReturnType<typeof vi.fn>;
  sendToPeer: ReturnType<typeof vi.fn>;
};

vi.mock('simple-peer', () => ({
  default: vi.fn(() => mockPeerInstance),
}));

vi.mock('./WebsocketController', () => ({
  default: {
    getInstance: () => mockWebsocketInstance,
  },
}));

vi.mock('../../actions/ConnectionActions', () => ({
  updatePeerTransport: vi.fn(),
}));

describe('WebRtcController', () => {
  beforeEach(() => {
    mockPeerInstance = {
      on: vi.fn(),
      send: vi.fn(),
      signal: vi.fn(),
      destroy: vi.fn(),
    };
    
    mockWebsocketInstance = {
      on: vi.fn(),
      sendToPeer: vi.fn(),
    };
    
    global.TextDecoder = vi.fn(() => ({
      decode: vi.fn(() => JSON.stringify({ action: 'KEY_DOWN', payload: { midi: 60 } })),
    })) as unknown as typeof TextDecoder;
    
    (WebRtcController as unknown as { instance: undefined }).instance = undefined;
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    WebRtcController.destroy();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = WebRtcController.getInstance();
      const instance2 = WebRtcController.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialization', () => {
    it('should register WebSocket event handlers', () => {
      WebRtcController.getInstance();
      
      expect(mockWebsocketInstance.on).toHaveBeenCalledWith(ACTION.SIGNAL, expect.any(Function));
      expect(mockWebsocketInstance.on).toHaveBeenCalledWith(ACTION.USER_CONNECT, expect.any(Function));
    });
  });

  describe('peer management', () => {
    it('should create peer when user connects', () => {
      WebRtcController.getInstance();
      
      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      
      // Trigger user connect
      userConnectHandler({ userId: 'user1' });
      
      expect(SimplePeer).toHaveBeenCalledWith({
        initiator: true,
        trickle: false,
      });
    });

    it('should handle peer connection', () => {
      const controller = WebRtcController.getInstance();
      
      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      userConnectHandler({ userId: 'user1' });
      
      const connectHandler = mockPeerInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'connect')?.[1];
      connectHandler();
      
      expect(updatePeerTransport).toHaveBeenCalledWith('user1', Transport.WEBRTC);
      expect(controller.getActivePeerIds().has('user1')).toBe(true);
    });

    it('should handle peer disconnection', () => {
      const controller = WebRtcController.getInstance();
      
      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      userConnectHandler({ userId: 'user1' });
      
      const connectHandler = mockPeerInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'connect')?.[1];
      connectHandler();
      
      // Verify peer is active
      expect(controller.getActivePeerIds().has('user1')).toBe(true);
      
      const closeHandler = mockPeerInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'close')?.[1];
      closeHandler();
      
      expect(controller.getActivePeerIds().has('user1')).toBe(false);
      expect(updatePeerTransport).toHaveBeenCalledWith('user1', Transport.WEBSOCKET);
    });
  });

  describe('messaging', () => {
    it('should send message to active peer', () => {
      const controller = WebRtcController.getInstance();
      
      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      userConnectHandler({ userId: 'user1' });
      
      const connectHandler = mockPeerInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'connect')?.[1];
      connectHandler();
      
      controller.sendToPeer('user1', 'KEY_DOWN', { midi: 60 });
      
      expect(mockPeerInstance.send).toHaveBeenCalledWith(JSON.stringify({
        action: 'KEY_DOWN',
        payload: { midi: 60 },
      }));
    });

    it('should throw error for inactive peer', () => {
      const controller = WebRtcController.getInstance();
      
      expect(() => controller.sendToPeer('nonexistent', 'KEY_DOWN', { midi: 60 }))
        .toThrow('Cannot send message to unavailable peer');
    });

    it('should broadcast to all active peers', () => {
      const controller = WebRtcController.getInstance();
      
      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      
      userConnectHandler({ userId: 'user1' });
      const connectHandler1 = mockPeerInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'connect')?.[1];
      connectHandler1();
      
      userConnectHandler({ userId: 'user2' });
      const connectHandler2 = mockPeerInstance.on.mock.calls
        .slice(-4) // Get the last set of on calls for the new peer
        .find((call: [string, EventHandler]) => call[0] === 'connect')?.[1];
      connectHandler2();
      
      controller.broadcast('KEY_DOWN', { midi: 60 });
      
      expect(controller.getActivePeerIds().size).toBe(2);
      expect(mockPeerInstance.send).toHaveBeenCalledWith(JSON.stringify({
        action: 'KEY_DOWN',
        payload: { midi: 60 },
      }));
    });
  });

  describe('data handling', () => {
    it('should process received data and trigger handlers', () => {
      const controller = WebRtcController.getInstance();
      const mockHandler = vi.fn();
      
      controller.on('KEY_DOWN', mockHandler);
      
      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      userConnectHandler({ userId: 'user1' });
      
      const dataHandler = mockPeerInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'data')?.[1];
      dataHandler(new Uint8Array([1, 2, 3]));
      
      expect(mockHandler).toHaveBeenCalledWith({ midi: 60, userId: 'user1' });
    });
  });

  describe('cleanup', () => {
    it('should destroy all peers and reset instance', () => {
      WebRtcController.getInstance();
      
      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      userConnectHandler({ userId: 'user1' });
      userConnectHandler({ userId: 'user2' });
      
      WebRtcController.destroy();
      
      expect(mockPeerInstance.destroy).toHaveBeenCalledTimes(2);
    });
  });
});
