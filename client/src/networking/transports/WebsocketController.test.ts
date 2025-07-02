import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WebsocketController, { WEBSOCKET_ACTIONS } from './WebsocketController';
import { addPeerConnection, removePeerConnection } from '../../actions/ConnectionActions';
import { Transport } from '../../constants';
import { io } from 'socket.io-client';

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
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../../selectors/workspaceSelectors', () => ({
  selectRoomId: vi.fn(() => 'test-room'),
}));

vi.mock('../../lib/Logger', () => ({
  default: {
    ERROR: vi.fn(),
  },
}));

// Mock socket instance
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};

describe('WebsocketController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (WebsocketController as any).instance = undefined;
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
    it('should configure socket with correct parameters', () => {
      WebsocketController.getInstance();
      
      expect(io).toHaveBeenCalledWith('ws://localhost:3001', {
        withCredentials: true,
        query: {
          displayName: 'test-user',
          roomId: 'test-room',
        },
      });
    });

    it('should set up core event listeners', () => {
      WebsocketController.getInstance();
      
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
  });

  describe('message broadcasting', () => {
    let controller: WebsocketController;

    beforeEach(() => {
      controller = WebsocketController.getInstance();
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

    it('should add event listeners', () => {
      const callback = vi.fn();
      
      controller.on('test-event', callback);
      
      expect(mockSocket.on).toHaveBeenCalledWith('test-event', callback);
    });

    it('should remove event listeners', () => {
      const callback = vi.fn();
      
      controller.off('test-event', callback);
      
      expect(mockSocket.off).toHaveBeenCalledWith('test-event', callback);
    });
  });

  describe('user connection management', () => {
    it('should handle user connections', () => {
      const controller = WebsocketController.getInstance();
      
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
    it('should disconnect socket on destroy', () => {
      WebsocketController.getInstance();
      
      WebsocketController.destroy();
      
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should reset instance on destroy', () => {
      const instance1 = WebsocketController.getInstance();
      WebsocketController.destroy();
      const instance2 = WebsocketController.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });
  });
});