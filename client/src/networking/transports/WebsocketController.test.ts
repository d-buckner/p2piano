import { io } from 'socket.io-client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addPeerConnection, removePeerConnection } from '../../actions/ConnectionActions';
import { Transport } from '../../constants';
import WebsocketController, { WEBSOCKET_ACTIONS } from './WebsocketController';

// Mock dependencies
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

vi.mock('../../actions/ConnectionActions', () => ({
  addPeerConnection: vi.fn(),
  removePeerConnection: vi.fn(),
}));

vi.mock('../../app/store', () => ({
  store: {},
}));

vi.mock('../../lib/ClientPreferences', () => ({
  default: {
    getDisplayName: vi.fn(() => 'test-user'),
  },
}));

vi.mock('../../lib/ConfigProvider', () => ({
  default: {
    getServiceUrl: vi.fn(() => 'ws://localhost:3001'),
  },
}));

vi.mock('../../lib/Logger', () => ({
  default: {
    ERROR: vi.fn(),
    WARN: vi.fn(),
    INFO: vi.fn(),
    DEBUG: vi.fn(),
  },
}));

vi.mock('../../selectors/workspaceSelectors', () => ({
  selectRoomId: vi.fn(() => 'test-room'),
}));

// Mock socket instance
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connected: true,
};

describe('WebsocketController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    // @ts-expect-error - accessing private property for testing
    WebsocketController.instance = undefined;
  });

  afterEach(() => {
    WebsocketController.destroy();
  });

  describe('singleton pattern', () => {
    it('should return same instance when called multiple times', () => {
      const instance1 = WebsocketController.getInstance();
      const instance2 = WebsocketController.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after destroy', () => {
      const instance1 = WebsocketController.getInstance();
      WebsocketController.destroy();
      const instance2 = WebsocketController.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('initialization', () => {
    it('should not create socket in constructor', () => {
      WebsocketController.getInstance();
      
      expect(io).not.toHaveBeenCalled();
    });

    it('should not set up event listeners before connection', () => {
      WebsocketController.getInstance();
      
      expect(mockSocket.on).not.toHaveBeenCalled();
    });
  });

  describe('connect', () => {
    it('should create socket with correct parameters', () => {
      const controller = WebsocketController.getInstance();
      
      controller.connect();
      
      expect(io).toHaveBeenCalledWith('ws://localhost:3001', {
        withCredentials: true,
        transports: ['websocket'],
        query: {
          displayName: 'test-user',
          roomId: 'test-room',
        },
      });
    });

    it('should set up core event listeners after connection', () => {
      const controller = WebsocketController.getInstance();
      
      controller.connect();
      
      expect(mockSocket.on).toHaveBeenCalledWith(
        WEBSOCKET_ACTIONS.USER_CONNECT,
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        WEBSOCKET_ACTIONS.USER_DISCONNECT,
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith('exception', expect.any(Function));
    });

    it('should transfer pre-registered handlers to socket', () => {
      const controller = WebsocketController.getInstance();
      const handler = vi.fn();
      
      // Register handler before connection
      controller.on('test-event', handler);
      
      controller.connect();
      
      expect(mockSocket.on).toHaveBeenCalledWith('test-event', handler);
    });

    it('should not connect if already connected', () => {
      const controller = WebsocketController.getInstance();
      
      controller.connect();
      controller.connect(); // Second call should be ignored
      
      expect(io).toHaveBeenCalledTimes(1);
    });
  });

  describe('message broadcasting', () => {
    let controller: WebsocketController;

    beforeEach(() => {
      controller = WebsocketController.getInstance();
      controller.connect();
    });

    it('should broadcast messages to all peers', () => {
      const payload = { data: 'test' };
      
      controller.broadcast('TEST_ACTION', payload);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('TEST_ACTION', payload);
    });

    it('should send targeted messages to specific peer', () => {
      const payload = { data: 'test' };
      const peerId = 'user123';
      
      controller.sendToPeer(peerId, 'TEST_ACTION', payload);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('TEST_ACTION', {
        ...payload,
        targetUserIds: [peerId],
      });
    });

    it('should send messages to multiple peers', () => {
      const payload = { data: 'test' };
      const peerIds = ['user1', 'user2', 'user3'];
      
      controller.sendToPeers(peerIds, 'TEST_ACTION', payload);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('TEST_ACTION', {
        ...payload,
        targetUserIds: peerIds,
      });
    });

    it('should handle broadcasting without payload', () => {
      controller.broadcast('SIMPLE_ACTION');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('SIMPLE_ACTION', undefined);
    });

  });

  describe('event handling', () => {
    let controller: WebsocketController;

    beforeEach(() => {
      controller = WebsocketController.getInstance();
    });

    it('should queue handlers when not connected', () => {
      const callback = vi.fn();
      
      controller.on('test-event', callback);
      
      // Should not call socket.on yet
      expect(mockSocket.on).not.toHaveBeenCalledWith('test-event', callback);
    });

    it('should add event listeners directly when connected', () => {
      const callback = vi.fn();
      
      controller.connect();
      controller.on('test-event', callback);
      
      expect(mockSocket.on).toHaveBeenCalledWith('test-event', callback);
    });

    it('should remove event listeners when connected', () => {
      const callback = vi.fn();
      
      controller.connect();
      controller.off('test-event', callback);
      
      expect(mockSocket.off).toHaveBeenCalledWith('test-event', callback);
    });

    it('should remove queued handlers when not connected', () => {
      const callback = vi.fn();
      
      controller.on('test-event', callback);
      controller.off('test-event', callback);
      controller.connect();
      
      // Handler should not be registered since it was removed
      expect(mockSocket.on).not.toHaveBeenCalledWith('test-event', callback);
    });
  });

  describe('user connection management', () => {
    it('should handle user connections', () => {
      const controller = WebsocketController.getInstance();
      controller.connect();
      
      // Get the registered callback for USER_CONNECT
      const connectCallback = mockSocket.on.mock.calls.find(
        call => call[0] === WEBSOCKET_ACTIONS.USER_CONNECT
      )?.[1];
      
      expect(connectCallback).toBeDefined();
      
      // Simulate user connection
      connectCallback({ userId: 'user123' });
      
      expect(addPeerConnection).toHaveBeenCalledWith(
        'user123',
        Transport.WEBSOCKET,
        0
      );
    });

    it('should handle user disconnections', () => {
      const controller = WebsocketController.getInstance();
      controller.connect();
      
      // Get the registered callback for USER_DISCONNECT
      const disconnectCallback = mockSocket.on.mock.calls.find(
        call => call[0] === WEBSOCKET_ACTIONS.USER_DISCONNECT
      )?.[1];
      
      expect(disconnectCallback).toBeDefined();
      
      // Simulate user disconnection
      disconnectCallback({ userId: 'user123' });
      
      expect(removePeerConnection).toHaveBeenCalledWith('user123');
    });
  });

  describe('error handling', () => {
    it('should handle rate limiting errors', () => {
      const controller = WebsocketController.getInstance();
      controller.connect();
      
      // Get the exception handler
      const exceptionCallback = mockSocket.on.mock.calls.find(
        call => call[0] === 'exception'
      )?.[1];
      
      expect(exceptionCallback).toBeDefined();
      
      // Simulate rate limiting error - should not throw
      expect(() => {
        exceptionCallback({ code: 429, message: 'Too many requests' });
      }).not.toThrow();
    });

    it('should handle general websocket errors', () => {
      const controller = WebsocketController.getInstance();
      controller.connect();
      
      const exceptionCallback = mockSocket.on.mock.calls.find(
        call => call[0] === 'exception'
      )?.[1];
      
      // Simulate general error - should not throw
      expect(() => {
        exceptionCallback({ message: 'Connection failed' });
      }).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should disconnect socket on destroy when connected', () => {
      const controller = WebsocketController.getInstance();
      controller.connect();
      
      WebsocketController.destroy();
      
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should handle destroy when not connected', () => {
      WebsocketController.getInstance();
      
      expect(() => {
        WebsocketController.destroy();
      }).not.toThrow();
    });

    it('should reset instance on destroy', () => {
      const instance1 = WebsocketController.getInstance();
      WebsocketController.destroy();
      const instance2 = WebsocketController.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });
  });
});
