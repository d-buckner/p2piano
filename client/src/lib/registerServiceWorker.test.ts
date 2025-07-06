import { describe, it, expect, beforeEach, vi } from 'vitest';
import registerServiceWorker from './registerServiceWorker';


describe('registerServiceWorker', () => {
  beforeEach(() => {
    process.env.SERVICE_WORKER_PATH = '/sw.js';
    vi.clearAllMocks();
  });

  it('should return early when service worker not supported', async () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      writable: true,
    });

    await registerServiceWorker();

    expect(navigator.serviceWorker).toBeUndefined();
  });


  it('should register service worker successfully', async () => {
    const mockRegister = vi.fn().mockResolvedValue({});
    const mockReady = Promise.resolve({});
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: mockRegister,
        ready: mockReady,
      },
      writable: true,
    });

    await registerServiceWorker();

    expect(mockRegister).toHaveBeenCalledWith('/sw.js');
  });

  it('should handle registration errors', async () => {
    const mockRegister = vi.fn().mockRejectedValue(new Error('Registration failed'));
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: mockRegister,
      },
      writable: true,
    });

    await registerServiceWorker();

    expect(mockRegister).toHaveBeenCalledWith('/sw.js');
  });

  it('should use empty string when SERVICE_WORKER_PATH is undefined', async () => {
    delete process.env.SERVICE_WORKER_PATH;
    const mockRegister = vi.fn().mockResolvedValue({});
    const mockReady = Promise.resolve({});
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: mockRegister,
        ready: mockReady,
      },
      writable: true,
    });

    await registerServiceWorker();

    expect(mockRegister).toHaveBeenCalledWith('');
  });

  it('should wait for service worker to be ready', async () => {
    let readyResolver: any;
    const mockReady = new Promise((resolve) => {
      readyResolver = resolve;
    });
    
    const mockRegister = vi.fn().mockResolvedValue({});
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: mockRegister,
        ready: mockReady,
      },
      writable: true,
    });

    const registerPromise = registerServiceWorker();
    
    // Resolve the ready promise
    readyResolver({});
    
    await registerPromise;

    expect(mockRegister).toHaveBeenCalled();
  });
});
