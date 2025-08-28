import { ServiceContainerContext } from '../hooks/useService';
import type { ServiceContainer } from '../di/ServiceContainer';
import type { ParentComponent } from 'solid-js';


interface ServiceProviderProps {
  container: ServiceContainer;
}

export const ServiceProvider: ParentComponent<ServiceProviderProps> = (props) => {
  return (
    <ServiceContainerContext.Provider value={props.container}> {/* eslint-disable-line solid/reactivity */}
      {props.children}
    </ServiceContainerContext.Provider>
  );
};
