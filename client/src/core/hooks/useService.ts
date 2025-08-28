import { createContext, useContext } from 'solid-js';
import type { ServiceContainer } from '../ServiceContainer';
import type { ServiceToken } from '../ServiceToken';

// Context to provide the service container to components
export const ServiceContainerContext = createContext<ServiceContainer>();

// Hook to resolve services in components
export function useService<T>(token: ServiceToken<T>): T {
  const container = useContext(ServiceContainerContext);
  
  if (!container) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  
  return container.resolve(token);
}
