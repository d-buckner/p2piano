import * as Automerge from '@automerge/automerge';
import Logger from '../../lib/Logger';
import { generateRandomHexActorId, toHex } from '../utils/actorUtils';
import type { SharedStore, SharedStoreKey } from '../types/StoreTypes';
import type { Patch } from '@automerge/automerge';

/**
 * Pure Automerge document operations.
 * Handles all CRDT document lifecycle and sync message generation/reception.
 */
export class CRDTDocument {
  private doc: Automerge.Doc<SharedStore>;
  private actorId: string;

  constructor(initialState: SharedStore, userId?: string) {
    // Generate actor ID
    this.actorId = userId ? toHex(userId) : generateRandomHexActorId();
    
    // Initialize document
    this.doc = Automerge.init<SharedStore>({ actor: this.actorId });
    
    // Set initial state
    this.doc = Automerge.change(this.doc, 'Initialize document', doc => {
      Object.assign(doc, initialState);
    });

    Logger.INFO('[CRDT] CRDTDocument initialized with actorId:', this.actorId);
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
    this.doc = Automerge.clone(this.doc, { actor: this.actorId });
    
    Logger.INFO('[CRDT] Updated actorId to:', this.actorId);
  }

  /**
   * Apply a change to a specific key in the document
   */
  change<K extends SharedStoreKey>(
    storeKey: K,
    changeFn: (state: SharedStore[K]) => void,
    message?: string
  ): void {
    Logger.DEBUG('[CRDT] Applying change to:', storeKey);
    
    this.doc = Automerge.change(this.doc, message || `Update ${storeKey}`, doc => {
      changeFn(doc[storeKey]);
    });
  }

  /**
   * Generate a sync message for a peer
   */
  generateSyncMessage(syncState: Automerge.SyncState): [Automerge.SyncState, Uint8Array | null] {
    return Automerge.generateSyncMessage(this.doc, syncState);
  }

  /**
   * Receive and apply a sync message from a peer
   */
  receiveSyncMessage(
    syncState: Automerge.SyncState,
    message: Uint8Array
  ): [Automerge.SyncState, boolean, Patch[]] {
    try {
      // Store the old heads before receiving the message
      const oldHeads = Automerge.getHeads(this.doc);
      
      const [newDoc, newSyncState] = Automerge.receiveSyncMessage(
        this.doc,
        syncState,
        message
      );
      
      const hasChanges = newDoc !== this.doc;
      let patches: Patch[] = [];
      
      if (hasChanges) {
        // Get patches showing what changed between the old and new document states
        const newHeads = Automerge.getHeads(newDoc);
        patches = Automerge.diff(newDoc, oldHeads, newHeads);
        this.doc = newDoc;
        Logger.DEBUG('[CRDT] Document updated from sync message with patches:', patches.length);
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
