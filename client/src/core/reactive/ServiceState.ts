import { ServiceEventBus } from './ServiceEventBus';


/**
 * Reactive service state with automatic event emission
 */
export class ServiceState<T extends Record<string, unknown>> {
  private state: T;
  private eventBus = new ServiceEventBus<T>();
  
  constructor(initialState: T) {
    this.state = { ...initialState };
    
    // Emit initial state for all keys
    Object.entries(initialState).forEach(([key, value]) => {
      this.eventBus.emit(key as keyof T, value);
    });
  }
  
  /**
   * Set a single state property and emit event
   */
  setState<K extends keyof T>(key: K, value: T[K]): void {
    this.state[key] = value;
    this.eventBus.emit(key, value);
  }
  
  /**
   * Set multiple state properties and emit events
   */
  setStates(updates: Partial<T>): void {
    Object.entries(updates).forEach(([key, value]) => {
      this.state[key as keyof T] = value;
      this.eventBus.emit(key as keyof T, value);
    });
  }
  
  /**
   * Get a single state property
   */
  getState<K extends keyof T>(key: K): T[K] {
    return this.state[key];
  }
  
  /**
   * Get all state
   */
  getAllState(): T {
    return { ...this.state };
  }
  
  /**
   * Access to the event bus for subscriptions
   */
  get events(): ServiceEventBus<T> {
    return this.eventBus;
  }
  
  /**
   * Clear state and events for testing
   */
  clear(): void {
    this.eventBus.clear();
  }
}

/**
 * Create a reactive service state with ergonomic proxy-based property access
 */
export function createServiceState<T extends Record<string, unknown>>(
  initialState: T
): T & { events: ServiceEventBus<T>; setState: ServiceState<T>['setState']; setStates: ServiceState<T>['setStates'] } {
  const serviceState = new ServiceState(initialState);
  
  return new Proxy(serviceState, {
    set(target, prop: string | symbol, value) {
      if (typeof prop === 'string' && prop in target.getAllState()) {
        target.setState(prop as keyof T, value);
        return true;
      }
      return false;
    },
    
    get(target, prop) {
      // Expose service methods
      if (prop === 'events') return target.events;
      if (prop === 'setState') return target.setState.bind(target);
      if (prop === 'setStates') return target.setStates.bind(target);
      
      // Return state property values
      if (typeof prop === 'string' && prop in target.getAllState()) {
        return target.getState(prop as keyof T);
      }
      
      // Fallback to target methods/properties
      return (target as unknown as Record<string, unknown>)[prop as string];
    },
    
    has(target, prop) {
      return prop === 'events' || 
             prop === 'setState' || 
             prop === 'setStates' ||
             (typeof prop === 'string' && prop in target.getAllState());
    },
    
    ownKeys(target) {
      return [...Object.keys(target.getAllState()), 'events', 'setState', 'setStates'];
    },
    
    getOwnPropertyDescriptor(target, prop) {
      if (prop === 'events' || prop === 'setState' || prop === 'setStates') {
        return { enumerable: true, configurable: true };
      }
      if (typeof prop === 'string' && prop in target.getAllState()) {
        return { enumerable: true, configurable: true };
      }
      return undefined;
    }
  }) as T & { events: ServiceEventBus<T>; setState: ServiceState<T>['setState']; setStates: ServiceState<T>['setStates'] };
}
