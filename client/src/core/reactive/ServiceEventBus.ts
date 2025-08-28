/**
 * Type-safe event bus for service state management
 */
export class ServiceEventBus<TEvents extends Record<string, unknown>> {
  private listeners = new Map<keyof TEvents, Set<(data: TEvents[keyof TEvents]) => void>>();
  private currentState = new Map<keyof TEvents, unknown>();
  
  /**
   * Emit an event with data and update current state
   */
  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    this.currentState.set(event, data);
    this.listeners.get(event)?.forEach(listener => listener(data));
  }
  
  /**
   * Get the current value for an event (state key)
   */
  getCurrentValue<K extends keyof TEvents>(event: K): TEvents[K] | undefined {
    return this.currentState.get(event) as TEvents[K] | undefined;
  }
  
  /**
   * Get all current state
   */
  getCurrentState(): Partial<TEvents> {
    const state = {} as Partial<TEvents>;
    this.currentState.forEach((value, key) => {
      state[key] = value as TEvents[keyof TEvents];
    });
    return state;
  }
  
  /**
   * Subscribe to an event
   */
  on<K extends keyof TEvents>(
    event: K, 
    listener: (data: TEvents[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as (data: TEvents[keyof TEvents]) => void);
    
    return () => this.listeners.get(event)?.delete(listener as (data: TEvents[keyof TEvents]) => void);
  }
  
  /**
   * Remove all listeners for testing/cleanup
   */
  clear(): void {
    this.listeners.clear();
    this.currentState.clear();
  }
  
  /**
   * Check if we have any listeners for an event
   */
  hasListeners<K extends keyof TEvents>(event: K): boolean {
    return this.listeners.has(event) && this.listeners.get(event)!.size > 0;
  }
}
