import { ServiceEventBus } from '../../reactive/ServiceEventBus';

/**
 * Base class for all services with reactive state management
 */
export abstract class Service<TState = Record<string, unknown>> {
  private eventBus = new ServiceEventBus<TState>();
  private state: TState;
  
  constructor(initialState: TState) {
    this.state = { ...initialState };
    
    // Emit initial state for all keys
    Object.entries(initialState).forEach(([key, value]) => {
      this.eventBus.emit(key as keyof TState, value as TState[keyof TState]);
    });
  }
  
  /**
   * Access to the event bus for reactive consumption
   */
  get events(): ServiceEventBus<TState> {
    return this.eventBus;
  }
  
  /**
   * Set a single state property and emit event
   */
  protected setState<K extends keyof TState>(key: K, value: TState[K]): void {
    this.state[key] = value;
    this.eventBus.emit(key, value);
  }
  
  /**
   * Set multiple state properties and emit events
   */
  protected setStates(updates: Partial<TState>): void {
    Object.entries(updates).forEach(([key, value]) => {
      this.state[key as keyof TState] = value;
      this.eventBus.emit(key as keyof TState, value);
    });
  }
  
  /**
   * Get a single state property
   */
  protected getState<K extends keyof TState>(key: K): TState[K] {
    return this.state[key];
  }
  
  /**
   * Get all current state
   */
  protected getAllState(): TState {
    return { ...this.state };
  }
  
  /**
   * Clear state and events for testing
   */
  public clear(): void {
    this.eventBus.clear();
  }
}
