import type { SharedStoreRoot } from './SharedStoreRoot';
import type { SharedStoreKey } from '../types/StoreTypes';

// Global shared store root - set when CRDT system initializes
let globalSharedRoot: SharedStoreRoot | null = null;

/**
 * Initialize the global shared store root.
 * Called by RoomBootstrap when CRDT system comes online.
 */
export function initializeGlobalStore(sharedRoot: SharedStoreRoot): void {
  globalSharedRoot = sharedRoot;
}

/**
 * Base class for actions that modify shared CRDT state.
 * Extends this class to create actions for your shared store slice.
 * 
 * Actions check the global shared root and gracefully degrade if CRDT isn't ready.
 */
export abstract class SharedStoreActions<T> {
  constructor(private storeKey: SharedStoreKey) {}

  /**
   * Make changes to the shared state using Automerge.
   * All mutations inside the callback are tracked and synchronized.
   * 
   * If CRDT system isn't ready yet, changes are silently ignored.
   */
  protected change(changeFn: (state: T) => void): void {
    if (!globalSharedRoot) return;
    
    globalSharedRoot.change(this.storeKey, changeFn);
  }
}
