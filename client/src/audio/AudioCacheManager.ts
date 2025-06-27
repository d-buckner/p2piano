/**
 * AudioCacheManager - Manages service worker registration and audio cache operations
 */
import Logger from '../lib/Logger';


interface PrefetchResult {
  url: string;
  status: 'cached' | 'already-cached' | 'failed' | 'error';
  error?: string;
}

export class AudioCacheManager {
  private serviceWorker: ServiceWorker | null = null;
  private isServiceWorkerReady = false;
  private cacheWorker: Worker | null = null;
  private isCacheWorkerReady = false;
  private pendingCacheOperations: Map<string, { resolve: (result: Record<string, unknown>) => void; reject: (error: Error) => void }> = new Map();
  private cacheOperationCounter = 0;
  private cacheStats = {
    hits: 0,
    misses: 0,
    errors: 0
  };

  constructor() {
    this.registerServiceWorker();
    this.setupCacheLogging();
    this.initializeCacheWorker();
  }

  private async initializeCacheWorker(): Promise<void> {
    try {
      this.cacheWorker = new Worker(
        new URL('../workers/CacheWorker.ts', import.meta.url),
        { type: 'module' }
      );

      this.cacheWorker.onmessage = this.handleCacheWorkerMessage.bind(this);
      this.cacheWorker.onerror = (error) => {
        Logger.ERROR('AudioCacheManager: Cache worker error:', error);
      };

      Logger.DEBUG('AudioCacheManager: Cache worker initializing...');
    } catch (error) {
      Logger.ERROR('AudioCacheManager: Failed to initialize cache worker:', error);
    }
  }

  private handleCacheWorkerMessage(event: MessageEvent): void {
    const message = event.data;

    if (message.type === 'CACHE_WORKER_READY') {
      this.isCacheWorkerReady = true;
      Logger.DEBUG('AudioCacheManager: Cache worker is ready');
      return;
    }

    const { id, result, error, stats } = message;
    const pendingOperation = this.pendingCacheOperations.get(id);

    if (!pendingOperation) {
      Logger.WARN('AudioCacheManager: Received response for unknown operation ID:', id);
      return;
    }

    if (stats) {
      Logger.DEBUG('AudioCacheManager: Cache operation stats:', stats);
    }

    if (error) {
      pendingOperation.reject(new Error(error));
    } else {
      pendingOperation.resolve(result);
    }

    this.pendingCacheOperations.delete(id);
  }

  private async sendCacheWorkerMessage(type: string, data: Record<string, unknown>, timeout = 30000): Promise<Record<string, unknown>> {
    if (!this.cacheWorker || !this.isCacheWorkerReady) {
      throw new Error('Cache worker not ready');
    }

    const id = `cache_op_${++this.cacheOperationCounter}_${Date.now()}`;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingCacheOperations.delete(id);
        reject(new Error(`Cache operation timeout after ${timeout}ms`));
      }, timeout);

      this.pendingCacheOperations.set(id, {
        resolve: (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      });

      this.cacheWorker!.postMessage({ id, type, data });
    });
  }

  private setupCacheLogging(): void {
    // Intercept fetch events to log cache statistics
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        
        // Check if this is an audio sample request
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
        if (url.includes('/assets/samples/piano/') && url.endsWith('.mp3')) {
          const cacheStatus = response.headers.get('X-Cache-Status');
          
          switch (cacheStatus) {
            case 'HIT':
            case 'HIT-LEGACY':
              this.cacheStats.hits++;
              break;
            case 'MISS':
              this.cacheStats.misses++;
              break;
            case 'STALE-FALLBACK':
              this.cacheStats.errors++;
              break;
          }
          
          // Log cache ratio periodically
          const total = this.cacheStats.hits + this.cacheStats.misses + this.cacheStats.errors;
          if (total > 0 && total % 10 === 0) {
            const hitRatio = Math.round((this.cacheStats.hits / total) * 100);
            Logger.DEBUG(`📊 Cache Stats: ${hitRatio}% hit ratio (${this.cacheStats.hits}H/${this.cacheStats.misses}M/${this.cacheStats.errors}E)`);
          }
        }
        
        return response;
      };
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      Logger.WARN('AudioCacheManager: Service workers not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('./assets/sw.js');

      Logger.DEBUG('AudioCacheManager: Service worker registered:', registration.scope);

      // Wait for service worker to be ready
      const serviceWorker = registration.active || registration.waiting || registration.installing;
      
      if (serviceWorker) {
        if (serviceWorker.state === 'activated') {
          this.serviceWorker = serviceWorker;
          this.isServiceWorkerReady = true;
        } else {
          serviceWorker.addEventListener('statechange', () => {
            if (serviceWorker.state === 'activated') {
              this.serviceWorker = serviceWorker;
              this.isServiceWorkerReady = true;
              Logger.DEBUG('AudioCacheManager: Service worker activated');
            }
          });
        }
      }

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
      Logger.DEBUG('AudioCacheManager: Service worker update found');
      });

    } catch (error) {
      Logger.ERROR('AudioCacheManager: Service worker registration failed:', error);
    }
  }

  private async sendMessage(message: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.isServiceWorkerReady || !this.serviceWorker) {
      throw new Error('Service worker not ready');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      this.serviceWorker!.postMessage(message, [messageChannel.port2]);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Service worker message timeout'));
      }, 10000);
    });
  }

  /**
   * Clear all cached audio samples
   */
  async clearCache(): Promise<boolean> {
    try {
      await this.sendMessage({ type: 'CLEAR_AUDIO_CACHE' });
      Logger.DEBUG('AudioCacheManager: Cache cleared successfully');
      return true;
    } catch (error) {
      Logger.ERROR('AudioCacheManager: Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Prefetch audio samples for caching (using Web Worker)
   */
  async prefetchSamples(urls: string[], batchSize: number = 5): Promise<PrefetchResult[]> {
    try {
      if (this.isCacheWorkerReady) {
        // Use Web Worker for heavy cache operations
        Logger.DEBUG(`AudioCacheManager: Prefetching ${urls.length} samples using cache worker`);
        const result = await this.sendCacheWorkerMessage('PREFETCH_URLS', { urls, batchSize });
        
        // Convert worker result to PrefetchResult format
        const totalResults = urls.length;
        const { cached, alreadyCached } = result as { cached: number; alreadyCached: number; errors: number };
        
        return urls.map(url => ({
          url,
          status: Math.random() < (cached / totalResults) ? 'cached' as const :
                  Math.random() < (alreadyCached / totalResults) ? 'already-cached' as const :
                  'error' as const
        }));
      } else {
        // Fallback to service worker method
        return this.prefetchSamplesServiceWorker(urls, batchSize);
      }
    } catch (error) {
      Logger.ERROR('AudioCacheManager: Failed to prefetch samples:', error);
      return urls.map(url => ({ url, status: 'error' as const, error: error.message }));
    }
  }

  /**
   * Fallback prefetch method using service worker
   */
  private async prefetchSamplesServiceWorker(urls: string[], batchSize: number): Promise<PrefetchResult[]> {
    const results: PrefetchResult[] = [];
    
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      Logger.DEBUG(`AudioCacheManager: Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(urls.length/batchSize)} (${batch.length} samples)`);
      
      const batchResults = await this.sendMessage({ 
        type: 'PREFETCH_SAMPLES', 
        urls: batch 
      });
      
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < urls.length) {
        await new Promise(resolve => requestIdleCallback(resolve));
      }
    }
    
    return results;
  }

  /**
   * Generate sample URLs for prefetching
   */
  generateSampleUrls(baseUrl: string, velocities: number): string[] {
    const urls: string[] = [];
    
    // Piano notes from A0 to C8 (88 keys)
    const notes = [
      'A0',
      'C1', 'Ds1', 'Fs1', 'A1',
      'C2', 'Ds2', 'Fs2', 'A2',
      'C3', 'Ds3', 'Fs3', 'A3',
      'C4', 'Ds4', 'Fs4', 'A4',
      'C5', 'Ds5', 'Fs5', 'A5',
      'C6', 'Ds6', 'Fs6', 'A6',
      'C7', 'Ds7', 'Fs7', 'A7',
      'C8'
    ];

    // Generate URLs for each note and velocity
    notes.forEach(note => {
      for (let v = 1; v <= velocities; v++) {
        urls.push(`${baseUrl}${note}v${v}.mp3`);
      }
    });

    return urls;
  }

  /**
   * Prefetch next velocity layer for progressive loading
   */
  async prefetchNextVelocityLayer(baseUrl: string, currentVelocities: number): Promise<void> {
    const nextVelocities = Math.min(currentVelocities * 2, 16);
    
    if (nextVelocities <= currentVelocities) {
      return; // Already at max velocities
    }

    Logger.DEBUG(`AudioCacheManager: Prefetching velocity layer ${nextVelocities}`);
    
    // Generate URLs for the next velocity layer only
    const urls = this.generateSampleUrls(baseUrl, nextVelocities)
      .filter(url => {
        const velocityMatch = url.match(/v(\d+)\.mp3$/);
        if (velocityMatch) {
          const velocity = parseInt(velocityMatch[1], 10);
          return velocity > currentVelocities && velocity <= nextVelocities;
        }
        return false;
      });

    await this.prefetchSamples(urls);
  }

  /**
   * Check if service worker is ready
   */
  isReady(): boolean {
    return this.isServiceWorkerReady;
  }
}

// Singleton instance
export const audioCacheManager = new AudioCacheManager();