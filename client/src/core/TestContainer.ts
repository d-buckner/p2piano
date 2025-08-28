import { ServiceContainer, ScopedContainer } from './ServiceContainer';
import type { ServiceToken } from './ServiceToken';


interface TestContainerInternal {
  parentContainer: ServiceContainer;
}


export class TestContainer extends ScopedContainer {
  public static create(): TestContainer {
    const container = new ServiceContainer();
    const scopeId = crypto.randomUUID();
    return new TestContainer(container, scopeId);
  }

  public mock<T>(token: ServiceToken<T>, mockInstance: T): void {
    // Register mock as scoped factory
    (this as TestContainerInternal).parentContainer.register({
      token,
      implementation: () => mockInstance,
      scope: 'scoped'
    });
  }

  public spy<T>(token: ServiceToken<T>, partialMock: Partial<T>): T {
    const fullMock = { ...partialMock } as T;
    this.mock(token, fullMock);
    return fullMock;
  }
}
