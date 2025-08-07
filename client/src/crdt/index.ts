import { MetronomeActions } from '../actions/MetronomeActions';
import { initializeGlobalStore } from './store/SharedStoreActions';
import type RealTimeController from '../networking/RealTimeController';
import type { SharedStoreRoot } from './store/SharedStoreRoot';

// Shared store root instance - created when collaboration is enabled
let sharedStoreRootInstance: SharedStoreRoot | null = null;

/**
 * Initialize the shared CRDT store system.
 * Called by RoomBootstrap when collaboration is enabled.
 */
export async function initializeSharedStore(realTimeController: RealTimeController): Promise<void> {
  if (sharedStoreRootInstance) {
    return; // Already initialized
  }
  
  // Dynamic import to avoid loading Automerge WASM at module load time
  const { SharedStoreRoot } = await import('./store/SharedStoreRoot');
  sharedStoreRootInstance = new SharedStoreRoot();
  await sharedStoreRootInstance.initialize(realTimeController);
  
  // Initialize global store so all actions start working
  initializeGlobalStore(sharedStoreRootInstance);
}

/**
 * Dispose the shared store system.
 */
export function disposeSharedStore(): void {
  if (sharedStoreRootInstance) {
    sharedStoreRootInstance.dispose();
    sharedStoreRootInstance = null;
  }
}

// Action instances - created immediately but won't work until CRDT initializes
export const metronomeActions = new MetronomeActions();
