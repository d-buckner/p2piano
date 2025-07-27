import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NetworkBridge } from './NetworkBridge';
import type RealTimeController from '../../networking/RealTimeController';
import type { AutomergeSyncMessage } from '../types/MessageTypes';

// Mock RealTimeController
const createMockRTC = () => ({
  on: vi.fn(),
  off: vi.fn(),
  sendToPeer: vi.fn(),
  isWebSocketConnected: vi.fn().mockReturnValue(true),
});

describe('NetworkBridge', () => {
  let mockRTC: ReturnType<typeof createMockRTC>;
  let networkBridge: NetworkBridge;
  const actorId = 'test-actor-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockRTC = createMockRTC();
    networkBridge = new NetworkBridge(mockRTC as unknown as RealTimeController, actorId);
  });

  describe('initialization', () => {
    it('should set up event handlers for required message types', () => {
      expect(mockRTC.on).toHaveBeenCalledWith('AUTOMERGE_PROTOCOL', expect.any(Function));
      expect(mockRTC.on).toHaveBeenCalledWith('USER_CONNECT', expect.any(Function));
      expect(mockRTC.on).toHaveBeenCalledWith('USER_DISCONNECT', expect.any(Function));
    });

    it('should bind event handlers for proper cleanup', () => {
      // Event handlers should be bound methods, not inline functions
      const calls = mockRTC.on.mock.calls;
      const automergeCalls = calls.filter(call => call[0] === 'AUTOMERGE_PROTOCOL');
      const connectCalls = calls.filter(call => call[0] === 'USER_CONNECT');
      const disconnectCalls = calls.filter(call => call[0] === 'USER_DISCONNECT');

      expect(automergeCalls).toHaveLength(1);
      expect(connectCalls).toHaveLength(1);
      expect(disconnectCalls).toHaveLength(1);
    });
  });

  describe('sync message handling', () => {
    let syncMessageHandler: (peerId: string, message: Uint8Array) => void;

    beforeEach(() => {
      syncMessageHandler = vi.fn();
      networkBridge.onSyncMessageReceived(syncMessageHandler);
    });

    it('should process valid Automerge sync messages', () => {
      const validMessage: AutomergeSyncMessage = {
        syncMessage: [1, 2, 3, 4, 5],
        userId: 'peer-456',
      };

      // Get the handler that was registered
      const automergeCalls = mockRTC.on.mock.calls.filter(call => call[0] === 'AUTOMERGE_PROTOCOL');
      const handler = automergeCalls[0][1];

      // Simulate receiving the message
      handler(validMessage);

      expect(syncMessageHandler).toHaveBeenCalledWith(
        'peer-456',
        expect.any(Uint8Array)
      );

      // Verify the Uint8Array conversion
      const receivedMessage = (syncMessageHandler as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][1];
      expect(Array.from(receivedMessage)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should ignore messages from own actor', () => {
      const ownMessage: AutomergeSyncMessage = {
        syncMessage: [1, 2, 3],
        userId: actorId, // Same as our actor ID
      };

      const automergeCalls = mockRTC.on.mock.calls.filter(call => call[0] === 'AUTOMERGE_PROTOCOL');
      const handler = automergeCalls[0][1];

      handler(ownMessage);

      expect(syncMessageHandler).not.toHaveBeenCalled();
    });

    it('should ignore invalid message types', () => {
      const invalidMessages = [
        null,
        undefined,
        'string',
        123,
        { wrongProperty: 'value' },
        { syncMessage: 'not-array', userId: 'peer-123' },
        { syncMessage: [1, 2, 3] }, // Missing userId
      ];

      const automergeCalls = mockRTC.on.mock.calls.filter(call => call[0] === 'AUTOMERGE_PROTOCOL');
      const handler = automergeCalls[0][1];

      invalidMessages.forEach(message => {
        handler(message);
      });

      expect(syncMessageHandler).not.toHaveBeenCalled();
    });
  });

  describe('peer connection handling', () => {
    let connectHandler: (peerId: string) => void;
    let disconnectHandler: (peerId: string) => void;

    beforeEach(() => {
      connectHandler = vi.fn();
      disconnectHandler = vi.fn();
      networkBridge.onPeerConnected(connectHandler);
      networkBridge.onPeerDisconnected(disconnectHandler);
    });

    it('should handle valid peer connection events', () => {
      const connectEvent = { userId: 'peer-789' };

      const connectCalls = mockRTC.on.mock.calls.filter(call => call[0] === 'USER_CONNECT');
      const handler = connectCalls[0][1];

      handler(connectEvent);

      expect(connectHandler).toHaveBeenCalledWith('peer-789');
    });

    it('should handle valid peer disconnection events', () => {
      const disconnectEvent = { userId: 'peer-789' };

      const disconnectCalls = mockRTC.on.mock.calls.filter(call => call[0] === 'USER_DISCONNECT');
      const handler = disconnectCalls[0][1];

      handler(disconnectEvent);

      expect(disconnectHandler).toHaveBeenCalledWith('peer-789');
    });

    it('should ignore connection events for own actor', () => {
      const ownConnectEvent = { userId: actorId };

      const connectCalls = mockRTC.on.mock.calls.filter(call => call[0] === 'USER_CONNECT');
      const handler = connectCalls[0][1];

      handler(ownConnectEvent);

      expect(connectHandler).not.toHaveBeenCalled();
    });

    it('should ignore invalid connection events', () => {
      const invalidEvents = [
        null,
        undefined,
        'string',
        123,
        {},
        { wrongProperty: 'value' },
      ];

      const connectCalls = mockRTC.on.mock.calls.filter(call => call[0] === 'USER_CONNECT');
      const handler = connectCalls[0][1];

      invalidEvents.forEach(event => {
        handler(event);
      });

      expect(connectHandler).not.toHaveBeenCalled();
    });
  });

  describe('sync message sending', () => {
    it('should send sync messages through RealTimeController', () => {
      const peerId = 'target-peer-456';
      const messageData = new Uint8Array([10, 20, 30, 40]);

      networkBridge.sendSyncMessage(peerId, messageData);

      expect(mockRTC.sendToPeer).toHaveBeenCalledWith(
        peerId,
        'AUTOMERGE_PROTOCOL',
        {
          syncMessage: [10, 20, 30, 40],
          userId: actorId,
        }
      );
    });

    it('should not send when WebSocket is disconnected', () => {
      mockRTC.isWebSocketConnected.mockReturnValue(false);

      const peerId = 'target-peer-456';
      const messageData = new Uint8Array([10, 20, 30]);

      networkBridge.sendSyncMessage(peerId, messageData);

      expect(mockRTC.sendToPeer).not.toHaveBeenCalled();
    });

    it('should broadcast to multiple peers', () => {
      const peerIds = ['peer-1', 'peer-2', 'peer-3'];
      const messageData = new Uint8Array([5, 10, 15]);

      networkBridge.broadcastSyncMessage(peerIds, messageData);

      expect(mockRTC.sendToPeer).toHaveBeenCalledTimes(3);
      
      peerIds.forEach(peerId => {
        expect(mockRTC.sendToPeer).toHaveBeenCalledWith(
          peerId,
          'AUTOMERGE_PROTOCOL',
          {
            syncMessage: [5, 10, 15],
            userId: actorId,
          }
        );
      });
    });
  });

  describe('actor ID updates', () => {
    it('should update actor ID for message sending', () => {
      const newActorId = 'new-actor-789';
      networkBridge.updateActorId(newActorId);

      const peerId = 'target-peer';
      const messageData = new Uint8Array([1, 2, 3]);

      networkBridge.sendSyncMessage(peerId, messageData);

      expect(mockRTC.sendToPeer).toHaveBeenCalledWith(
        peerId,
        'AUTOMERGE_PROTOCOL',
        {
          syncMessage: [1, 2, 3],
          userId: newActorId, // Should use new actor ID
        }
      );
    });

    it('should filter own messages with updated actor ID', () => {
      const newActorId = 'new-actor-789';
      networkBridge.updateActorId(newActorId);

      const syncMessageHandler = vi.fn();
      networkBridge.onSyncMessageReceived(syncMessageHandler);

      const messageFromSelf: AutomergeSyncMessage = {
        syncMessage: [1, 2, 3],
        userId: newActorId, // Message from updated actor ID
      };

      const automergeCalls = mockRTC.on.mock.calls.filter(call => call[0] === 'AUTOMERGE_PROTOCOL');
      const handler = automergeCalls[0][1];

      handler(messageFromSelf);

      expect(syncMessageHandler).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should remove all event handlers on dispose', () => {
      networkBridge.dispose();

      expect(mockRTC.off).toHaveBeenCalledWith('AUTOMERGE_PROTOCOL', expect.any(Function));
      expect(mockRTC.off).toHaveBeenCalledWith('USER_CONNECT', expect.any(Function));
      expect(mockRTC.off).toHaveBeenCalledWith('USER_DISCONNECT', expect.any(Function));
    });

    it('should clear callback references on dispose', () => {
      const syncHandler = vi.fn();
      const connectHandler = vi.fn();
      const disconnectHandler = vi.fn();

      networkBridge.onSyncMessageReceived(syncHandler);
      networkBridge.onPeerConnected(connectHandler);
      networkBridge.onPeerDisconnected(disconnectHandler);

      networkBridge.dispose();

      // Simulate events after dispose - handlers should not be called
      const automergeCalls = mockRTC.on.mock.calls.filter(call => call[0] === 'AUTOMERGE_PROTOCOL');
      const handler = automergeCalls[0][1];
      
      handler({
        syncMessage: [1, 2, 3],
        userId: 'other-peer',
      });

      expect(syncHandler).not.toHaveBeenCalled();
    });
  });
});
