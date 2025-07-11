import SimplePeer from 'simple-peer';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Import after mocks
import { updatePeerTransport } from '../../actions/ConnectionActions';
import { Transport } from '../../constants';
import { selectPeerConnection } from '../../selectors/connectionSelectors';
import { mockIdleCallbacks } from '../../test/setup';
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

vi.mock('../../selectors/connectionSelectors', () => ({
  selectPeerConnection: vi.fn(() => () => ({ transport: 'WEBRTC' })),
}));

// ponyfill is mocked globally in test setup

describe('WebRtcController', () => {
  beforeEach(() => {
    // Clear the global callback queue
    mockIdleCallbacks.length = 0;
    // Create a factory function to return new mock instances for each peer
    const createMockPeer = () => ({
      on: vi.fn(),
      send: vi.fn(),
      signal: vi.fn(),
      destroy: vi.fn(),
    });

    mockPeerInstance = createMockPeer();

    // Mock SimplePeer to return new instances each time
    (SimplePeer as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => createMockPeer());

    mockWebsocketInstance = {
      on: vi.fn(),
      sendToPeer: vi.fn(),
    };

    vi.stubGlobal('TextDecoder', vi.fn(() => ({
      decode: vi.fn(() => JSON.stringify({ action: 'KEY_DOWN', payload: { midi: 60 } })),
    })));

    (WebRtcController as unknown as { instance: undefined }).instance = undefined;

    vi.clearAllMocks();
  });

  afterEach(() => {
    WebRtcController.destroy();
    vi.unstubAllGlobals();
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

      expect(SimplePeer).toHaveBeenCalledWith(
        expect.objectContaining({
          initiator: true,
        })
      );
    });

    it('should handle peer connection', () => {
      const controller = WebRtcController.getInstance();

      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      userConnectHandler({ userId: 'user1' });

      const peer = SimplePeer.mock.results[0].value;
      const connectHandler = peer.on.mock.calls
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

      const peer = SimplePeer.mock.results[0].value;
      const connectHandler = peer.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'connect')?.[1];
      connectHandler();

      // Verify peer is active
      expect(controller.getActivePeerIds().has('user1')).toBe(true);

      const closeHandler = peer.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'close')?.[1];
      closeHandler();

      expect(controller.getActivePeerIds().has('user1')).toBe(false);
      expect(updatePeerTransport).toHaveBeenCalledWith('user1', Transport.WEBSOCKET);
    });

    it('should not recreate peer when receiving multiple signals from same user', () => {
      WebRtcController.getInstance();

      const signalHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.SIGNAL)?.[1];

      // First signal should create peer
      signalHandler({ userId: 'user1', signalData: { type: 'offer' } });
      expect(SimplePeer).toHaveBeenCalledTimes(1);

      // Second signal should not create new peer
      signalHandler({ userId: 'user1', signalData: { type: 'candidate' } });
      expect(SimplePeer).toHaveBeenCalledTimes(1);

      // Third signal should not create new peer
      signalHandler({ userId: 'user1', signalData: { type: 'candidate' } });
      expect(SimplePeer).toHaveBeenCalledTimes(1);

      // Signal from different user should create new peer
      signalHandler({ userId: 'user2', signalData: { type: 'offer' } });
      expect(SimplePeer).toHaveBeenCalledTimes(2);
    });
  });

  describe('messaging', () => {
    it('should send message to active peer', () => {
      const controller = WebRtcController.getInstance();

      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      userConnectHandler({ userId: 'user1' });

      const peer = SimplePeer.mock.results[0].value;
      const connectHandler = peer.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'connect')?.[1];
      connectHandler();

      controller.sendToPeer('user1', 'KEY_DOWN', { midi: 60 });

      expect(peer.send).toHaveBeenCalledWith(JSON.stringify({
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

      // Create first peer
      userConnectHandler({ userId: 'user1' });
      const peer1 = SimplePeer.mock.results[0].value;
      const connectHandler1 = peer1.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'connect')?.[1];
      connectHandler1();

      // Create second peer
      userConnectHandler({ userId: 'user2' });
      const peer2 = SimplePeer.mock.results[1].value;
      const connectHandler2 = peer2.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'connect')?.[1];
      connectHandler2();

      controller.broadcast('KEY_DOWN', { midi: 60 });

      expect(controller.getActivePeerIds().size).toBe(2);
      expect(peer1.send).toHaveBeenCalledWith(JSON.stringify({
        action: 'KEY_DOWN',
        payload: { midi: 60 },
      }));
      expect(peer2.send).toHaveBeenCalledWith(JSON.stringify({
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

      const peer = SimplePeer.mock.results[0].value;
      const dataHandler = peer.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'data')?.[1];
      dataHandler(new Uint8Array([1, 2, 3]));

      expect(mockHandler).toHaveBeenCalledWith({ midi: 60, userId: 'user1' });
    });
  });

  describe('signal rate limiting', () => {
    it('should use requestIdleCallback to schedule WebRTC signals', () => {
      WebRtcController.getInstance();

      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      userConnectHandler({ userId: 'user1' });

      const peer = SimplePeer.mock.results[0].value;
      const signalHandler = peer.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'signal')?.[1];

      // Trigger a signal
      signalHandler({ type: 'offer', sdp: 'mock-sdp' });

      // Signal should be queued via requestIdleCallback, not sent immediately
      expect(mockIdleCallbacks).toHaveLength(1);
      expect(mockWebsocketInstance.sendToPeer).not.toHaveBeenCalled();

      // Execute the queued callback
      mockIdleCallbacks[0]();

      // Now the signal should be sent
      expect(mockWebsocketInstance.sendToPeer).toHaveBeenCalledWith('user1', ACTION.SIGNAL, {
        userId: 'user1',
        signalData: { type: 'offer', sdp: 'mock-sdp' },
      });
    });

    it('should schedule multiple signals independently', () => {
      WebRtcController.getInstance();

      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      userConnectHandler({ userId: 'user1' });

      const peer = SimplePeer.mock.results[0].value;
      const signalHandler = peer.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'signal')?.[1];

      // Trigger multiple signals
      signalHandler({ type: 'offer', sdp: 'mock-sdp' });
      signalHandler({ type: 'candidate', candidate: 'mock-candidate' });

      // Both signals should be queued
      expect(mockIdleCallbacks).toHaveLength(2);
      expect(mockWebsocketInstance.sendToPeer).not.toHaveBeenCalled();

      // Execute first callback
      mockIdleCallbacks[0]();
      expect(mockWebsocketInstance.sendToPeer).toHaveBeenCalledWith('user1', ACTION.SIGNAL, {
        userId: 'user1',
        signalData: { type: 'offer', sdp: 'mock-sdp' },
      });

      // Execute second callback
      mockIdleCallbacks[1]();
      expect(mockWebsocketInstance.sendToPeer).toHaveBeenCalledWith('user1', ACTION.SIGNAL, {
        userId: 'user1',
        signalData: { type: 'candidate', candidate: 'mock-candidate' },
      });

      expect(mockWebsocketInstance.sendToPeer).toHaveBeenCalledTimes(2);
    });
  });

  describe('connection retry logic', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should retry connection up to maximum attempts for initiator', () => {
      const controller = WebRtcController.getInstance();

      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      
      // Trigger user connect (makes this peer the initiator)
      userConnectHandler({ userId: 'user1' });
      
      // Verify initial peer was created
      expect(SimplePeer).toHaveBeenCalledTimes(1);
      expect(controller.getActivePeerIds().has('user1')).toBe(false);
      
      // Fast-forward past first timeout (1000ms with exponential backoff)
      vi.advanceTimersByTime(1000);
      
      // Should have created retry attempt
      expect(SimplePeer).toHaveBeenCalledTimes(2);
      
      // Fast-forward past second timeout (2000ms)
      vi.advanceTimersByTime(2000);
      
      // Should have created second retry attempt
      expect(SimplePeer).toHaveBeenCalledTimes(3);
      
      // Fast-forward past third timeout (4000ms)
      vi.advanceTimersByTime(4000);
      
      // Should have created third retry attempt
      expect(SimplePeer).toHaveBeenCalledTimes(4);
      
      // Fast-forward past fourth timeout (8000ms)
      vi.advanceTimersByTime(8000);
      
      // Should have created fourth retry attempt (max attempts = 4)
      expect(SimplePeer).toHaveBeenCalledTimes(5);
      
      // Fast-forward more to ensure no more retries
      vi.advanceTimersByTime(16000);
      
      // Should not create more attempts after reaching maximum
      expect(SimplePeer).toHaveBeenCalledTimes(5);
    });

    it('should stop retrying after maximum attempts reached', () => {
      const controller = WebRtcController.getInstance();

      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      
      userConnectHandler({ userId: 'user1' });
      
      // Fast-forward through all retry attempts with exponential backoff
      // 1000ms + 2000ms + 4000ms + 8000ms = 15000ms total
      vi.advanceTimersByTime(15000);
      
      // Verify we stopped at maximum attempts (original + 4 retries = 5 total)
      expect(SimplePeer).toHaveBeenCalledTimes(5);
      expect(controller.getActivePeerIds().has('user1')).toBe(false);
      
      // Advance further to ensure no more retries
      vi.advanceTimersByTime(16000);
      expect(SimplePeer).toHaveBeenCalledTimes(5);
    });

    it('should not retry for non-initiator peers', () => {
      WebRtcController.getInstance();

      const signalHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.SIGNAL)?.[1];
      
      // Receive signal (makes this peer non-initiator)
      signalHandler({ userId: 'user1', signalData: { type: 'offer' } });
      
      // Verify initial peer was created
      expect(SimplePeer).toHaveBeenCalledTimes(1);
      
      // Fast-forward past retry timeouts
      vi.advanceTimersByTime(8000);
      
      // Should not have created any retry attempts for non-initiator
      expect(SimplePeer).toHaveBeenCalledTimes(1);
    });

    it('should not retry if peer connects successfully within timeout', () => {
      const controller = WebRtcController.getInstance();

      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      
      userConnectHandler({ userId: 'user1' });
      
      // Simulate successful connection before timeout
      const peer = SimplePeer.mock.results[0].value;
      const connectHandler = peer.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'connect')?.[1];
      connectHandler();
      
      // Verify peer is now active
      expect(controller.getActivePeerIds().has('user1')).toBe(true);
      
      // Fast-forward past timeout (1000ms for first attempt)
      vi.advanceTimersByTime(1000);
      
      // Should not retry since connection was successful
      expect(SimplePeer).toHaveBeenCalledTimes(1);
      expect(controller.getActivePeerIds().has('user1')).toBe(true);
    });

    it('should handle multiple peers with independent retry timers', () => {
      const controller = WebRtcController.getInstance();

      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      
      // Create first peer
      userConnectHandler({ userId: 'user1' });
      expect(SimplePeer).toHaveBeenCalledTimes(1);
      
      // Advance 500ms
      vi.advanceTimersByTime(500);
      
      // Create second peer
      userConnectHandler({ userId: 'user2' });
      expect(SimplePeer).toHaveBeenCalledTimes(2);
      
      // Advance 500ms more (total 1000ms from user1, 500ms from user2)
      vi.advanceTimersByTime(500);
      
      // user1 should retry (reached 1000ms timeout)
      expect(SimplePeer).toHaveBeenCalledTimes(3);
      expect(controller.getActivePeerIds().has('user1')).toBe(false);
      expect(controller.getActivePeerIds().has('user2')).toBe(false);
      
      // Advance 500ms more (user2 reaches 1000ms timeout)
      vi.advanceTimersByTime(500);
      
      // user2 should retry
      expect(SimplePeer).toHaveBeenCalledTimes(4);
    });

    it('should use exponential backoff for retry delays', () => {
      WebRtcController.getInstance();

      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      
      userConnectHandler({ userId: 'user1' });
      
      // Test that delays follow exponential backoff: 1s, 2s, 4s, 8s (capped)
      const expectedDelays = [1000, 2000, 4000, 8000];
      
      for (let i = 0; i < expectedDelays.length; i++) {
        const delay = expectedDelays[i];
        
        // Advance time by the expected delay
        vi.advanceTimersByTime(delay);
        
        // Should create new peer after each timeout
        expect(SimplePeer).toHaveBeenCalledTimes(i + 2); // +1 for initial, +1 for this retry
        
        // Don't advance beyond max attempts
        if (i >= 3) break;
      }
    });

    it('should not attempt reconnection when peer connection no longer exists in store', () => {
      // Mock selectPeerConnection to return null (user left room)
      vi.mocked(selectPeerConnection).mockReturnValue(() => null);

      const controller = WebRtcController.getInstance();

      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      
      userConnectHandler({ userId: 'user1' });
      
      const peer = SimplePeer.mock.results[0].value;
      
      // Simulate connection first
      const connectHandler = peer.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'connect')?.[1];
      connectHandler();
      
      expect(controller.getActivePeerIds().has('user1')).toBe(true);
      
      // Now simulate peer disconnection when user has left room
      const closeHandler = peer.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === 'close')?.[1];
      closeHandler();
      
      // Should remove peer from active set
      expect(controller.getActivePeerIds().has('user1')).toBe(false);
      
      // Should NOT call updatePeerTransport since peer connection doesn't exist
      expect(updatePeerTransport).not.toHaveBeenCalledWith('user1', Transport.WEBSOCKET);
      
      // Should NOT attempt reconnection since peer connection doesn't exist
      expect(SimplePeer).toHaveBeenCalledTimes(1); // Only the original peer creation
    });
  });

  describe('race condition handling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should not get "No peer found" when signals arrive while peer exists in Map', () => {
      const controller = WebRtcController.getInstance();

      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      const signalHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.SIGNAL)?.[1];
      
      // Create initial peer connection as initiator (via USER_CONNECT)
      userConnectHandler({ userId: 'user1' });
      const firstPeer = SimplePeer.mock.results[0].value;
      
      // Verify peer is in Map and can receive signals
      expect(SimplePeer).toHaveBeenCalledTimes(1);
      
      // Send a signal while peer exists - should work fine
      signalHandler({ 
        userId: 'user1', 
        signalData: { type: 'offer', sdp: 'test-offer' } 
      });
      
      // Signal should be processed by the peer
      expect(firstPeer.signal).toHaveBeenCalledWith({ 
        type: 'offer', 
        sdp: 'test-offer' 
      });
      
      // Remove from active but keep in Map (simulating disconnected but not destroyed peer)
      controller.getActivePeerIds().delete('user1');
      
      // Send another signal - should still work because peer is in Map
      signalHandler({ 
        userId: 'user1', 
        signalData: { type: 'answer', sdp: 'test-answer' } 
      });
      
      // Signal should still be processed by the same peer
      expect(firstPeer.signal).toHaveBeenCalledWith({ 
        type: 'answer', 
        sdp: 'test-answer' 
      });
    });

    it('should store peer in Map immediately after creation to handle async signals', () => {
      const controller = WebRtcController.getInstance();

      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      const signalHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.SIGNAL)?.[1];
      
      // Create initial peer as initiator
      userConnectHandler({ userId: 'user1' });
      expect(SimplePeer).toHaveBeenCalledTimes(1);
      
      // Immediately after peer creation, signals should be handleable
      // This tests our fix where we moved peers.set() to happen immediately
      signalHandler({ 
        userId: 'user1', 
        signalData: { type: 'answer', sdp: 'immediate-answer' } 
      });
      
      const firstPeer = SimplePeer.mock.results[0].value;
      
      // Signal should be handled by the peer that was just created
      expect(firstPeer.signal).toHaveBeenCalledWith({ 
        type: 'answer', 
        sdp: 'immediate-answer' 
      });
      
      // Verify the peer is properly stored and accessible
      expect(controller.getActivePeerIds().has('user1')).toBe(false); // Not connected yet
    });
  });

  describe('cleanup', () => {
    it('should destroy all peers and reset instance', () => {
      WebRtcController.getInstance();

      const userConnectHandler = mockWebsocketInstance.on.mock.calls
        .find((call: [string, EventHandler]) => call[0] === ACTION.USER_CONNECT)?.[1];
      userConnectHandler({ userId: 'user1' });
      userConnectHandler({ userId: 'user2' });

      const peer1 = SimplePeer.mock.results[0].value;
      const peer2 = SimplePeer.mock.results[1].value;

      WebRtcController.destroy();

      expect(peer1.destroy).toHaveBeenCalledTimes(1);
      expect(peer2.destroy).toHaveBeenCalledTimes(1);
    });
  });
});
