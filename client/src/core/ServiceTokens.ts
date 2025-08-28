import { createServiceToken } from './ServiceToken';
import type { AudioEngineService } from './services/audio/AudioEngineService';
import type { INetworkService } from './services/network/INetworkService';

// Core service tokens for p2piano
export const ServiceTokens = {
  AudioEngine: createServiceToken<AudioEngineService>('AudioEngine'),
  NetworkService: createServiceToken<INetworkService>('NetworkService'),
} as const;
