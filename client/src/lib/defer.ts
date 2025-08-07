/**
 * Defers execution to the next tick of the event loop
 * Useful for avoiding blocking the UI thread
 */
export function defer(fn: () => Promise<void> | void): void {
  setTimeout(fn, 0);
}
