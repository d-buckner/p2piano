import type { SharedStoreRoot } from './SharedStoreRoot';
import type { SharedStoreKey } from '../types/StoreTypes';

/**
 * Base class for actions that modify shared CRDT state.
 * Extends this class to create actions for your shared store slice.
 * 
 * Features don't need to know about CRDT internals - just use the change() method
 * to make modifications and everything else is handled automatically.
 */
export abstract class SharedStoreActions<T> {
  constructor(
    private storeKey: SharedStoreKey,
    private sharedRoot: SharedStoreRoot
  ) {}

  /**
   * Make changes to the shared state using Automerge.
   * All mutations inside the callback are tracked and synchronized.
   * 
   * @example
   * ```ts
   * setBpm(bpm: number) {
   *   this.change(state => {
   *     state.bpm = bpm;
   *   });
   * }
   * ```
   */
  protected change(changeFn: (state: T) => void): void {
    this.sharedRoot.change(this.storeKey, changeFn);
  }
}
