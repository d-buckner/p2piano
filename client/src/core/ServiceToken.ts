// Type-safe service token system for dependency injection

import type { Service } from './services/base';

// Service token type - uses symbol with phantom type for compile-time safety
export interface ServiceToken<T extends Service> {
  readonly __type: T;
  readonly symbol: symbol;
  readonly name: string;
}

// Service scope types
export type ServiceScope = 'singleton' | 'transient' | 'scoped';

// Constructor type for services
export type ServiceConstructor<T> = new (...args: unknown[]) => T;

// Factory function type for services
export type ServiceFactory<T> = (...dependencies: unknown[]) => T;

// Service implementation can be constructor or factory
export type ServiceImplementation<T> = ServiceConstructor<T> | ServiceFactory<T>;

// Service registration definition
export interface ServiceRegistration<T extends Service> {
  token: ServiceToken<T>;
  implementation: ServiceImplementation<T>;
  dependencies?: ServiceToken<T>[];
  scope?: ServiceScope;
  name?: string;
}

// Create a type-safe service token
export function createServiceToken<T>(name: string): ServiceToken<T> {
  return {
    __type: undefined as unknown as T, // Phantom type for compile-time only
    symbol: Symbol(name),
    name
  };
}

// Check if implementation is a constructor
export function isConstructor<T>(impl: ServiceImplementation<T>): impl is ServiceConstructor<T> {
  return impl.prototype !== undefined;
}
