import { setStore, store } from '../../app/store';
import Logger from '../../lib/Logger';
import { selectConnectedPeerIds } from '../../selectors/connectionSelectors';
import { selectUserId } from '../../selectors/workspaceSelectors';
import { NetworkBridge } from '../services/NetworkBridge';
import { initialSharedStore } from '../types/StoreTypes';
import type RealTimeController from '../../networking/RealTimeController';
import type { CRDTDocument as ICRDTDocument } from '../services/CRDTDocument';
import type { SharedStore, SharedStoreKey } from '../types/StoreTypes';
import type { SyncState, Patch } from '@automerge/automerge';

/**
 * Root manager for the shared CRDT store.
 * Orchestrates CRDTDocument and NetworkBridge for collaborative state management.
 * 
 * This is the coordination layer between CRDT operations and network communication.
 * Features use SharedStoreActions without knowing about sync internals.
 */
export class SharedStoreRoot {
  private document: ICRDTDocument | null = null;
  private networkBridge: NetworkBridge | null = null;
  private initSyncState: (() => SyncState) | null = null;
  private syncStates: Map<string, SyncState> = new Map();

  constructor() {
    // Initialize CRDT document with default state
  }

  async initialize(realTimeController: RealTimeController) {
    const { CRDTDocument } = await import('../services/CRDTDocument');
    // Update document with user ID
    const userId = selectUserId(store) || 'unknown';
    this.document = new CRDTDocument(initialSharedStore, userId);
    this.initSyncState = (await import('@automerge/automerge')).initSyncState;

    // Set up network bridge
    this.networkBridge = new NetworkBridge(realTimeController, this.document.getActorId());
    this.setupNetworkHandlers();

    // Sync initial state to SolidJS store
    this.syncToSolidStore();

    // Start syncing with connected peers
    this.initiateSyncWithConnectedPeers();
  }

  private getDoc(): ICRDTDocument {
    if (!this.document) {
      throw new Error('Cannot get document before initializing');
    }

    return this.document;
  }

  /**
   * Apply a change to a specific key in the shared store.
   * Used by SharedStoreActions subclasses.
   */
  change<K extends SharedStoreKey>(
    storeKey: K,
    changeFn: (state: SharedStore[K]) => void
  ): void {
    // Apply the change to the document
    this.getDoc().change(storeKey, changeFn);

    // Sync specific key to SolidJS store
    this.syncKeyToSolidStore(storeKey);

    // Send sync messages to all connected peers
    this.broadcastSyncToAllPeers();
  }

  /**
   * Set up network bridge handlers
   */
  private setupNetworkHandlers(): void {
    if (!this.networkBridge) {
      return;
    }

    // Set up sync message handler
    this.networkBridge.onSyncMessageReceived((peerId, message) => {
      this.handleSyncMessage(peerId, message);
    });

    // Set up peer connection handlers
    this.networkBridge.onPeerConnected((peerId) => {
      this.handlePeerConnect(peerId);
    });

    this.networkBridge.onPeerDisconnected((peerId) => {
      this.handlePeerDisconnect(peerId);
    });
  }

  /**
   * Handle incoming sync messages from peers
   */
  private handleSyncMessage(peerId: string, message: Uint8Array): void {
    // Initialize sync state for new peer if needed
    if (!this.syncStates.has(peerId)) {
      this.syncStates.set(peerId, this.initSyncState!());
    }

    const syncState = this.syncStates.get(peerId)!;
    const [newSyncState, hasChanges, patches] = this.getDoc().receiveSyncMessage(syncState, message);

    // Update sync state
    this.syncStates.set(peerId, newSyncState);

    if (hasChanges) {
      // Apply patches granularly to SolidJS store
      this.applyPatchesToStore(patches);
    }

    // Send response sync message if needed
    this.sendSyncToPeer(peerId);
  }

  /**
   * Handle new peer connection
   */
  private handlePeerConnect(peerId: string): void {
    Logger.INFO('[CRDT] Peer connected:', peerId);

    // Initialize sync state for the peer
    this.syncStates.set(peerId, this.initSyncState!());

    // Send initial sync
    this.sendSyncToPeer(peerId);
  }

  /**
   * Handle peer disconnection
   */
  private handlePeerDisconnect(peerId: string): void {
    Logger.INFO('[CRDT] Peer disconnected:', peerId);

    // Clean up sync state
    this.syncStates.delete(peerId);
  }

  /**
   * Send sync message to a specific peer
   */
  private sendSyncToPeer(peerId: string): void {
    if (!this.networkBridge) {
      return;
    }

    const syncState = this.syncStates.get(peerId);
    if (!syncState) {
      return;
    }

    // Generate sync message
    const [newSyncState, syncMessage] = this.getDoc().generateSyncMessage(syncState);

    // Update sync state
    this.syncStates.set(peerId, newSyncState);

    // Send if there's a message
    if (syncMessage) {
      this.networkBridge.sendSyncMessage(peerId, syncMessage);
    }
  }

  /**
   * Broadcast sync to all connected peers
   */
  private broadcastSyncToAllPeers(): void {
    this.syncStates.forEach((_, peerId) => {
      this.sendSyncToPeer(peerId);
    });
  }

  /**
   * Initiate sync with already connected peers
   */
  private initiateSyncWithConnectedPeers(): void {
    if (!this.networkBridge) {
      return;
    }

    // Get connected peers from the store
    const connectedPeers = selectConnectedPeerIds(store);
    const myActorId = this.getDoc().getActorId();

    connectedPeers.forEach(peerId => {
      if (peerId !== myActorId) {
        this.handlePeerConnect(peerId);
      }
    });
  }

  /**
   * Apply patches granularly to SolidJS store
   */
  private applyPatchesToStore(patches: Patch[]): void {
    const docState = this.getDoc().getState();

    // Check for root level changes first
    const hasRootChange = patches.some(p => p.path.length === 0);
    if (hasRootChange) {
      setStore('shared', docState);
      return;
    }

    // Deduplicate the top-level keys we need to update
    const updatedKeys = new Set<SharedStoreKey>();
    patches.forEach(patch => {
      if (patch.path.length > 0) {
        updatedKeys.add(patch.path[0] as SharedStoreKey);
      }
    });

    // Update each affected top-level key
    // This is safer than trying to handle all patch types (put, del, insert, splice, etc.)
    // and ensures correctness while still being more granular than full store sync
    updatedKeys.forEach(key => {
      setStore('shared', key, docState[key]);
    });

  }

  /**
   * Sync specific key to SolidJS store (for local changes)
   */
  private syncKeyToSolidStore<K extends SharedStoreKey>(storeKey: K): void {
    const docState = this.getDoc().getState();
    setStore('shared', storeKey, docState[storeKey]);

  }

  /**
   * Sync entire document to SolidJS store (for remote changes)
   */
  private syncToSolidStore(): void {
    const docState = this.getDoc().getState();
    setStore('shared', docState);

  }

  /**
   * Get current document state (for debugging)
   */
  getDocumentState(): SharedStore {
    return this.getDoc().getState();
  }

  dispose(): void {
    if (this.networkBridge) {
      this.networkBridge.dispose();
      this.networkBridge = null;
    }

    this.syncStates.clear();
  }
}
