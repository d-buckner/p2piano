import { 
  init, 
  change, 
  clone, 
  generateSyncMessage, 
  receiveSyncMessage, 
  getHeads, 
  diff,
  type Doc, 
  type SyncState, 
  type Patch 
} from '@automerge/automerge';
import Logger from '../../lib/Logger';
import { generateRandomHexActorId, toHex } from '../utils/actorUtils';
import type { SharedStore, SharedStoreKey } from '../types/StoreTypes';

/**
 * Pure Automerge document operations.
 * Handles all CRDT document lifecycle and sync message generation/reception.
 */
export class CRDTDocument {
  private doc: Doc<SharedStore>;
  private actorId: string;

  constructor(initialState: SharedStore, userId?: string) {
    // Generate actor ID
    this.actorId = userId ? toHex(userId) : generateRandomHexActorId();
    
    // Initialize document
    this.doc = init<SharedStore>({ actor: this.actorId });
    
    // Set initial state
    this.doc = change(this.doc, 'Initialize document', doc => {
      Object.assign(doc, initialState);
    });

  }

  /**
   * Update the actor ID and clone the document
   */
  updateActorId(userId: string): void {
    const newActorId = toHex(userId);
    
    if (newActorId === this.actorId) {
      return;
    }

    this.actorId = newActorId;
    this.doc = clone(this.doc, { actor: this.actorId });
    
  }

  /**
   * Apply a change to a specific key in the document
   */
  change<K extends SharedStoreKey>(
    storeKey: K,
    changeFn: (state: SharedStore[K]) => void,
    message?: string
  ): void {
    
    this.doc = change(this.doc, message || `Update ${storeKey}`, doc => {
      changeFn(doc[storeKey]);
    });
  }

  /**
   * Generate a sync message for a peer
   */
  generateSyncMessage(syncState: SyncState): [SyncState, Uint8Array | null] {
    return generateSyncMessage(this.doc, syncState);
  }

  /**
   * Receive and apply a sync message from a peer
   */
  receiveSyncMessage(
    syncState: SyncState,
    message: Uint8Array
  ): [SyncState, boolean, Patch[]] {
    try {
      // Store the old heads before receiving the message
      const oldHeads = getHeads(this.doc);
      
      const [newDoc, newSyncState] = receiveSyncMessage(
        this.doc,
        syncState,
        message
      );
      
      const hasChanges = newDoc !== this.doc;
      let patches: Patch[] = [];
      
      if (hasChanges) {
        // Get patches showing what changed between the old and new document states
        const newHeads = getHeads(newDoc);
        patches = diff(newDoc, oldHeads, newHeads);
        this.doc = newDoc;
      }
      
      return [newSyncState, hasChanges, patches];
    } catch (error) {
      Logger.ERROR('[CRDT] Failed to receive sync message:', error);
      // Return original sync state and no changes on error
      return [syncState, false, []];
    }
  }

  /**
   * Get the current document state
   */
  getState(): SharedStore {
    return this.doc;
  }

  /**
   * Get the actor ID
   */
  getActorId(): string {
    return this.actorId;
  }
}
