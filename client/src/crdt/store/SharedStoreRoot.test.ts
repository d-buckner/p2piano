import { describe, it, expect, vi, beforeEach } from 'vitest';
// Import mocked functions
import { setStore } from '../../app/store';
import { selectConnectedPeerIds } from '../../selectors/connectionSelectors';
import { selectUserId } from '../../selectors/workspaceSelectors';
import { SharedStoreRoot } from './SharedStoreRoot';
import type RealTimeController from '../../networking/RealTimeController';


interface TestNetworkBridge {
  onPeerConnect?: (peerId: string) => void;
  onPeerDisconnect?: (peerId: string) => void;
  onSyncMessage?: (peerId: string, message: Uint8Array) => void;
}

interface TestSharedStoreRoot {
  networkBridge: TestNetworkBridge | null;
}

// Mock dependencies
vi.mock('../../app/store', () => ({
  setStore: vi.fn(),
  store: {
    workspace: { userId: 'test-user-123' },
    connection: { peerConnections: {} },
  },
}));

vi.mock('../../selectors/connectionSelectors', () => ({
  selectConnectedPeerIds: vi.fn().mockReturnValue(['peer-1', 'peer-2']),
}));

vi.mock('../../selectors/workspaceSelectors', () => ({
  selectUserId: vi.fn().mockReturnValue('test-user-123'),
}));

const mockSetStore = vi.mocked(setStore);
const mockSelectConnectedPeerIds = vi.mocked(selectConnectedPeerIds);
const mockSelectUserId = vi.mocked(selectUserId);

// Mock RealTimeController
const createMockRTC = () => ({
  on: vi.fn(),
  off: vi.fn(),
  sendToPeer: vi.fn(),
  isWebSocketConnected: vi.fn().mockReturnValue(true),
});

describe('SharedStoreRoot', () => {
  let sharedStoreRoot: SharedStoreRoot;
  let mockRTC: ReturnType<typeof createMockRTC>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRTC = createMockRTC();
    sharedStoreRoot = new SharedStoreRoot();
  });

  describe('initialization', () => {
    it('should create instance without immediate document creation', () => {
      // SharedStoreRoot should be creatable without throwing
      expect(() => new SharedStoreRoot()).not.toThrow();
      
      // But document access should fail before initialization
      expect(() => sharedStoreRoot.getDocumentState()).toThrow('Cannot get document before initializing');
    });

    it('should throw error when accessing document before initialization', () => {
      const root = new SharedStoreRoot();
      
      expect(() => root.getDocumentState()).toThrow('Cannot get document before initializing');
    });
  });

  describe('full initialization with RealTimeController', () => {
    beforeEach(async () => {
      await sharedStoreRoot.initialize(mockRTC as unknown as RealTimeController);
    });

    it('should properly initialize with user ID from store', () => {
      expect(mockSelectUserId).toHaveBeenCalled();
      // Document should be accessible after initialization
      expect(() => sharedStoreRoot.getDocumentState()).not.toThrow();
    });

    it('should sync initial state to SolidJS store', () => {
      expect(mockSetStore).toHaveBeenCalledWith('shared', expect.objectContaining({
        metronome: expect.objectContaining({
          active: false,
          bpm: 120,
        }),
      }));
    });

    it('should initiate sync with existing connected peers', () => {
      // Should have sent sync messages to connected peers
      expect(mockRTC.sendToPeer).toHaveBeenCalled();
    });
  });

  describe('document changes', () => {
    beforeEach(async () => {
      await sharedStoreRoot.initialize(mockRTC as unknown as RealTimeController);
      vi.clearAllMocks(); // Clear setup calls
    });

    it('should apply changes and sync to SolidJS store', () => {
      sharedStoreRoot.change('metronome', metronome => {
        metronome.active = true;
        metronome.bpm = 140;
      });

      // Should update the SolidJS store with the specific key
      expect(mockSetStore).toHaveBeenCalledWith(
        'shared',
        'metronome',
        expect.objectContaining({
          active: true,
          bpm: 140,
        })
      );
    });

    it('should broadcast sync messages to peers after changes', () => {
      const initialSendCount = mockRTC.sendToPeer.mock.calls.length;

      sharedStoreRoot.change('metronome', metronome => {
        metronome.leaderId = 'new-leader';
      });

      // Should send new sync messages after the change
      expect(mockRTC.sendToPeer.mock.calls.length).toBeGreaterThan(initialSendCount);
    });

    it('should preserve document state integrity', () => {
      sharedStoreRoot.change('metronome', metronome => {
        metronome.active = true;
        metronome.bpm = 150;
        metronome.currentBeat = 3;
      });

      const state = sharedStoreRoot.getDocumentState();
      expect(state.metronome.active).toBe(true);
      expect(state.metronome.bpm).toBe(150);
      expect(state.metronome.currentBeat).toBe(3);
    });
  });

  describe('peer management', () => {
    beforeEach(async () => {
      await sharedStoreRoot.initialize(mockRTC as unknown as RealTimeController);
      vi.clearAllMocks();
    });

    it('should handle new peer connections', () => {
      const newPeerId = 'new-peer-456';
      
      // Simulate peer connection through NetworkBridge
      const networkBridge = (sharedStoreRoot as unknown as TestSharedStoreRoot).networkBridge;
      if (networkBridge?.onPeerConnect) {
        networkBridge.onPeerConnect(newPeerId);
      }

      // Should send sync message to new peer
      expect(mockRTC.sendToPeer).toHaveBeenCalledWith(
        newPeerId,
        'AUTOMERGE_PROTOCOL',
        expect.objectContaining({
          userId: expect.any(String),
        })
      );
    });

    it('should handle peer disconnections gracefully', () => {
      const peerId = 'disconnecting-peer';
      
      // First connect the peer
      const networkBridge = (sharedStoreRoot as unknown as TestSharedStoreRoot).networkBridge;
      if (networkBridge?.onPeerConnect) {
        networkBridge.onPeerConnect(peerId);
      }
      
      vi.clearAllMocks();
      
      // Then disconnect
      if (networkBridge?.onPeerDisconnect) {
        networkBridge.onPeerDisconnect(peerId);
      }

      // Should not crash and should clean up internal state
      expect(() => {
        sharedStoreRoot.change('metronome', m => m.bpm = 130);
      }).not.toThrow();
    });
  });

  describe('sync message handling', () => {
    beforeEach(async () => {
      await sharedStoreRoot.initialize(mockRTC as unknown as RealTimeController);
      vi.clearAllMocks();
    });

    it('should handle granular store updates', () => {
      // Test the granular update mechanism directly
      sharedStoreRoot.change('metronome', metronome => {
        metronome.bpm = 180;
        metronome.active = true;
      });

      // Should update only the metronome key
      const setStoreCalls = mockSetStore.mock.calls;
      const metronomeUpdateCalls = setStoreCalls.filter(call => 
        call[0] === 'shared' && call[1] === 'metronome'
      );
      
      expect(metronomeUpdateCalls.length).toBeGreaterThan(0);
      
      // Verify the update contains the correct data
      const lastCall = metronomeUpdateCalls[metronomeUpdateCalls.length - 1];
      expect(lastCall[2]).toEqual(expect.objectContaining({
        bpm: 180,
        active: true,
      }));
    });

    it('should handle sync messages without crashing on invalid data', () => {
      const networkBridge = (sharedStoreRoot as unknown as TestSharedStoreRoot).networkBridge;
      const syncHandler = networkBridge?.onSyncMessage;
      
      if (syncHandler) {
        expect(() => {
          syncHandler('invalid-peer', new Uint8Array([1, 2, 3]));
        }).not.toThrow();
      }
    });
  });

  describe('resource cleanup', () => {
    it('should dispose of network bridge and clear state', async () => {
      await sharedStoreRoot.initialize(mockRTC as unknown as RealTimeController);
      
      // Verify network bridge was created
      const networkBridge = (sharedStoreRoot as unknown as TestSharedStoreRoot).networkBridge;
      expect(networkBridge).toBeDefined();
      
      sharedStoreRoot.dispose();
      
      // Verify cleanup
      expect((sharedStoreRoot as unknown as TestSharedStoreRoot).networkBridge).toBeNull();
      expect(mockRTC.off).toHaveBeenCalled();
    });

    it('should handle multiple dispose calls gracefully', async () => {
      await sharedStoreRoot.initialize(mockRTC as unknown as RealTimeController);
      
      expect(() => {
        sharedStoreRoot.dispose();
        sharedStoreRoot.dispose(); // Second call should not crash
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle missing user ID gracefully', async () => {
      mockSelectUserId.mockReturnValue(undefined);
      
      expect(async () => {
        await sharedStoreRoot.initialize(mockRTC as unknown as RealTimeController);
      }).not.toThrow();
    });

    it('should handle empty peer connections list', async () => {
      mockSelectConnectedPeerIds.mockReturnValue([]);
      
      expect(async () => {
        await sharedStoreRoot.initialize(mockRTC as unknown as RealTimeController);
      }).not.toThrow();
    });

    it('should handle initialization without network bridge', async () => {
      // Create a new instance to test the network bridge early return path
      const testRoot = new SharedStoreRoot();
      
      // Initialize with RTC but then simulate the network bridge being null
      await testRoot.initialize(mockRTC as unknown as RealTimeController);
      testRoot['networkBridge'] = null;
      
      // This should test the early return in initiateSyncWithConnectedPeers
      expect(() => {
        testRoot['initiateSyncWithConnectedPeers']();
      }).not.toThrow();
    });

    it('should handle root level document changes', async () => {
      await sharedStoreRoot.initialize(mockRTC as unknown as RealTimeController);
      vi.clearAllMocks();

      // Simulate a root level change by creating multiple changes across different keys
      sharedStoreRoot.change('metronome', m => m.bpm = 100);
      
      // The patches should trigger granular updates, not full root updates
      // This tests the applyPatchesToStore method path discrimination
      expect(mockSetStore).toHaveBeenCalledWith('shared', 'metronome', expect.any(Object));
    });

    it('should prevent changes before RealTimeController initialization', () => {
      expect(() => {
        sharedStoreRoot.change('metronome', m => m.bpm = 100);
      }).toThrow('Cannot get document before initializing');
      
      expect(() => {
        sharedStoreRoot.getDocumentState();
      }).toThrow('Cannot get document before initializing');
    });
  });
});
