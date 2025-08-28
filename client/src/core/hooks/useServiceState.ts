import { type Accessor, createSignal, onCleanup } from 'solid-js';
import { useService } from './useService';
import type { Service } from '../services/base/Service';
import type { ServiceToken } from '../ServiceToken';

// Utility type to extract state type from Service
type ServiceStateType<T> = T extends Service<infer TState> ? TState : never;

/**
 * Hook to consume service state reactively
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useServiceState<TService extends Service<any>>(
  token: ServiceToken<TService>
): ServiceStateType<TService> {
  const service = useService(token);
  const signalCache = new Map<string, Accessor<unknown>>();
  
  const getOrCreateSignal = (key: string): Accessor<unknown> => {
    if (!signalCache.has(key)) {
      const currentValue = service.events.getCurrentValue(key);
      const [signal, setSignal] = createSignal(currentValue!);
      
      // Subscribe to changes immediately (not in onMount)
      const cleanup = service.events.on(key, (data: unknown) => {
        setSignal(() => data);
      });
      
      // Set up cleanup when component unmounts
      onCleanup(() => {
        cleanup();
      });
      
      // eslint-disable-next-line solid/reactivity
      signalCache.set(key, signal);
    }
    
    return signalCache.get(key)!;
  };
  
  // Create signals for all existing state properties upfront
  const currentState = service.events.getCurrentState();
  Object.keys(currentState).forEach(key => {
    getOrCreateSignal(key);
  });
  
  const debugState = () => service.events.getCurrentState();
  
  // Create a real object that contains current state values for debugging
  const createDebugSnapshot = () => {
    const currentState = service.events.getCurrentState();
    const snapshot = {} as Record<string, unknown>;
    Object.keys(currentState).forEach(key => {
      snapshot[key] = currentState[key as keyof typeof currentState];
    });
    return snapshot;
  };

  return new Proxy({} as Record<string, unknown>, {
    get(_target, prop: string | symbol) {
      // Special debugging properties that Chrome DevTools can easily inspect
      if (prop === '__debug' || prop === '__state') {
        return createDebugSnapshot();
      }
      // Support for debugging methods
      if (prop === 'toJSON') {
        return debugState;
      }
      if (prop === Symbol.toStringTag) {
        return 'ServiceState';
      }
      if (prop === 'valueOf') {
        return debugState;
      }
      // Support for console.log inspection
      if (prop === 'inspect' || prop === Symbol.for('nodejs.util.inspect.custom')) {
        return debugState;
      }
      
      // Handle regular state properties
      if (typeof prop === 'string') {
        const signal = getOrCreateSignal(prop);
        return signal();
      }
      
      return undefined;
    },
    
    has(_target, prop) {
      return typeof prop === 'string' && service.events.getCurrentValue(prop) !== undefined;
    },
    
    ownKeys() {
      return Object.keys(service.events.getCurrentState());
    },
    
    getOwnPropertyDescriptor(_target, prop) {
      if (typeof prop === 'string' && service.events.getCurrentValue(prop) !== undefined) {
        return {
          enumerable: true,
          configurable: true
        };
      }
      return undefined;
    }
  });
}

/**
 * Hook to consume a single service state property reactively
 */
export function useServiceEvent<K extends string>(
  service: Service<Record<string, unknown>>,
  event: K,
  fallbackValue: unknown
): Accessor<unknown> {
  const currentValue = service.events.getCurrentValue(event) ?? fallbackValue;
  const [signal, setSignal] = createSignal<unknown>(currentValue);
  
  // Subscribe immediately (not in onMount)
  const cleanup = service.events.on(event, (data: unknown) => {
    setSignal(() => data);
  });
  
  onCleanup(() => {
    cleanup();
  });
  
  return signal;
}
