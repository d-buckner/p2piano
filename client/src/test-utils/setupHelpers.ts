import { vi } from 'vitest';

/**
 * Common setup for audio-related tests
 */
export const setupAudioMocks = () => {
  // Mock Web Audio API globals
  global.AudioContext = vi.fn();
  global.requestIdleCallback = vi.fn();
  
  // Mock Tone.js context if needed
  const mockToneContext = {
    state: 'running',
    sampleRate: 44100,
  };
  
  return { mockToneContext };
};

/**
 * Common setup for WebSocket/networking tests
 */
export const setupNetworkingMocks = () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;
  
  return { mockFetch };
};

/**
 * Common setup for DOM/browser APIs
 */
export const setupBrowserMocks = () => {
  // Mock window.location
  const mockLocation = {
    pathname: '/',
    href: 'http://localhost:3000/',
  };
  
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
  });
  
  // Mock window event listeners
  const mockAddEventListener = vi.fn();
  const mockRemoveEventListener = vi.fn();
  
  window.addEventListener = mockAddEventListener;
  window.removeEventListener = mockRemoveEventListener;
  
  return {
    mockLocation,
    mockAddEventListener,
    mockRemoveEventListener,
  };
};

/**
 * Common cleanup for singleton instances
 */
export const cleanupSingletons = (...singletonClasses: Array<{ destroy?: () => void; getInstance?: () => unknown }>) => {
  singletonClasses.forEach(cls => {
    if (cls.destroy) {
      cls.destroy();
    }
    // Reset private static instance if accessible
    if ('instance' in cls) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cls as any).instance = undefined;
    }
  });
};

/**
 * Setup common test environment with all mocks
 */
export const setupTestEnvironment = () => {
  const audio = setupAudioMocks();
  const networking = setupNetworkingMocks();
  const browser = setupBrowserMocks();
  
  return {
    ...audio,
    ...networking,
    ...browser,
  };
};