import { ServiceContainer } from './ServiceContainer';
import { AudioEngineService } from './services/audio/AudioEngineService';
import { NetworkService } from './services/network/NetworkService';
import { ServiceTokens } from './ServiceTokens';
import type { ServiceToken } from './ServiceToken';

// Main application container setup
export class AppContainer {
  private container = new ServiceContainer();

  public initialize(): void {
    // Register NetworkService first (no dependencies)
    this.container.register({
      token: ServiceTokens.NetworkService,
      implementation: NetworkService,
      dependencies: [],
      scope: 'singleton'
    });

    // Register AudioEngine service with NetworkService dependency
    this.container.register({
      token: ServiceTokens.AudioEngine,
      implementation: AudioEngineService,
      dependencies: [ServiceTokens.NetworkService],
      scope: 'singleton'
    });
  }

  public resolve<T>(token: ServiceToken<T>): T {
    return this.container.resolve(token);
  }
}

// Global app container instance
export const appContainer = new AppContainer();
