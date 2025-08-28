import { isConstructor } from './ServiceToken';
import type { ServiceToken, ServiceRegistration, ServiceScope } from './ServiceToken';


export class ServiceContainerError extends Error {
  constructor(message: string, public readonly token?: ServiceToken<unknown>) {
    super(message);
    this.name = 'ServiceContainerError';
  }
}

export class ServiceContainer {
  private registrations = new Map<symbol, ServiceRegistration<unknown>>();
  private singletonInstances = new Map<symbol, unknown>();
  private scopedInstances = new Map<string, Map<symbol, unknown>>();

  public register<T>(registration: ServiceRegistration<T>): void {
    const { token, scope = 'singleton' } = registration;
    
    if (this.registrations.has(token.symbol)) {
      throw new ServiceContainerError(`Service ${token.name} is already registered`);
    }

    this.registrations.set(token.symbol, { ...registration, scope });
  }

  public resolve<T>(token: ServiceToken<T>, scopeId?: string): T {
    const registration = this.registrations.get(token.symbol);
    if (!registration) {
      throw new ServiceContainerError(`Service ${token.name} is not registered`, token);
    }

    // Check existing instances
    const existingInstance = this.getExistingInstance(token, registration.scope, scopeId);
    if (existingInstance) {
      return existingInstance;
    }

    // Create new instance
    const instance = this.createInstance(registration);
    this.storeInstance(token, instance, registration.scope, scopeId);
    return instance;
  }

  public createScope(scopeId?: string): ScopedContainer {
    const id = scopeId || crypto.randomUUID();
    return new ScopedContainer(this, id);
  }

  private getExistingInstance<T>(token: ServiceToken<T>, scope: ServiceScope, scopeId?: string): T | undefined {
    switch (scope) {
      case 'singleton':
        return this.singletonInstances.get(token.symbol);
      case 'scoped':
        if (!scopeId) return undefined;
        return this.scopedInstances.get(scopeId)?.get(token.symbol);
      case 'transient':
        return undefined;
    }
  }

  private createInstance<T>(registration: ServiceRegistration<T>): T {
    const { implementation, dependencies = [] } = registration;
    const resolvedDeps = dependencies.map(dep => this.resolve(dep));

    if (isConstructor(implementation)) {
      return new implementation(...resolvedDeps);
    } else {
      return implementation(...resolvedDeps);
    }
  }

  private storeInstance<T>(token: ServiceToken<T>, instance: T, scope: ServiceScope, scopeId?: string): void {
    switch (scope) {
      case 'singleton':
        this.singletonInstances.set(token.symbol, instance);
        break;
      case 'scoped':
        if (scopeId) {
          if (!this.scopedInstances.has(scopeId)) {
            this.scopedInstances.set(scopeId, new Map());
          }
          this.scopedInstances.get(scopeId)!.set(token.symbol, instance);
        }
        break;
    }
  }
}

export class ScopedContainer {
  constructor(
    private parentContainer: ServiceContainer,
    private scopeId: string
  ) {}

  public resolve<T>(token: ServiceToken<T>): T {
    return this.parentContainer.resolve(token, this.scopeId);
  }
}
