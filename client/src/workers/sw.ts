// Service Worker for Audio Sample Caching
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'audio-v1';
const AUDIO_CACHE_NAME = 'audio-samples-v1';

// Cache audio samples for 30 days
const AUDIO_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

interface PrefetchResult {
  url: string;
  status: 'cached' | 'already-cached' | 'failed' | 'error';
  error?: string;
}

self.addEventListener('install', () => {
  console.log('Installing service worker');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE_NAME) {
            console.log('Deleting old audio cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle audio sample requests
  if (url.pathname.includes('/assets/samples/piano/') && url.pathname.endsWith('.mp3')) {
    event.respondWith(handleAudioRequest(event.request));
    return;
  }
  
  // Let other requests pass through
  event.respondWith(fetch(event.request));
});

async function handleAudioRequest(request: Request) {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cached response is still fresh
    const cachedDate = cachedResponse.headers.get('sw-cached-date');
    const fileName = request.url.split('/').pop() || 'unknown';
    
    if (cachedDate) {
      const cacheAge = Date.now() - parseInt(cachedDate, 10);
      if (cacheAge < AUDIO_CACHE_DURATION) {
        // Add cache status header for debugging
        const response = cachedResponse.clone();
        const headers = new Headers(response.headers);
        headers.set('X-Cache-Status', 'HIT');
        headers.set('X-Cache-Age', Math.round(cacheAge / 1000).toString());
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers
        });
      } else {
        // Cache is stale, remove it
        await cache.delete(request);
      }
    } else {
      // Old cache without date, serve it anyway but refresh in background
      // Fetch fresh version in background
      fetch(request).then(response => {
        if (response.ok) {
          const responseClone = response.clone();
          const headers = new Headers(responseClone.headers);
          headers.set('sw-cached-date', Date.now().toString());
          
          const newResponse = new Response(responseClone.body, {
            status: responseClone.status,
            statusText: responseClone.statusText,
            headers: headers
          });
          
          cache.put(request, newResponse);
        }
      }).catch(err => {
        console.warn(`Audio cache refresh failed for: ${fileName}`, err);
      });
      
      // Add cache status header
      const response = cachedResponse.clone();
      const headers = new Headers(response.headers);
      headers.set('X-Cache-Status', 'HIT-LEGACY');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      });
    }
  }
  
  try {
    const fileName = request.url.split('/').pop() || 'unknown';
    console.log(`Audio cache miss: ${fileName} - fetching from network`);
    
    const response = await fetch(request);
    
    if (response.ok) {
      // Clone the response before caching
      const responseToCache = response.clone();
      
      // Add timestamp to track cache age and cache status headers
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-date', Date.now().toString());
      headers.set('Cache-Control', 'public, max-age=2592000'); // 30 days
      headers.set('X-Cache-Status', 'MISS');
      
      const cacheResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      // Cache the response
      await cache.put(request, cacheResponse);
      
      // Add cache status to original response for debugging
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('X-Cache-Status', 'MISS');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    }
    
    console.warn(`⚠️ FETCH FAILED: ${fileName} - HTTP ${response.status}`);
    return response;
  } catch (error) {
    const fileName = request.url.split('/').pop() || 'unknown';
    console.error(`❌ NETWORK ERROR: ${fileName}`, error);
    
    const staleResponse = await cache.match(request);
    if (staleResponse) {
      const headers = new Headers(staleResponse.headers);
      headers.set('X-Cache-Status', 'STALE-FALLBACK');
      
      return new Response(staleResponse.body, {
        status: staleResponse.status,
        statusText: staleResponse.statusText,
        headers: headers
      });
    }
    
    // Return network error
    throw error;
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_AUDIO_CACHE') {
    clearAudioCache().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
  
  if (event.data && event.data.type === 'PREFETCH_SAMPLES') {
    prefetchSamples(event.data.urls).then(result => {
      event.ports[0].postMessage(result);
    });
  }
});

async function clearAudioCache(): Promise<void> {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const keys = await cache.keys();
  
  for (const request of keys) {
    await cache.delete(request);
  }
  
  console.log('Cleared audio cache');
}

async function prefetchSamples(urls: string[]): Promise<PrefetchResult[]> {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  
  // Process all URLs in parallel
  const promises = urls.map(async (url) => {
    try {
      const cached = await cache.match(url);
      if (cached) {
        return { url, status: 'already-cached' };
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const headers = new Headers(response.headers);
        headers.set('sw-cached-date', Date.now().toString());
        headers.set('Cache-Control', 'public, max-age=2592000');
        
        const cacheResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers
        });
        
        await cache.put(url, cacheResponse);
        return { url, status: 'cached' };
      } else {
        return { url, status: 'failed' as const, error: response.statusText };
      }
    } catch (error: unknown) {
      return { url, status: 'error' as const, error: String(error) };
    }
  });
  
  // Wait for all parallel operations to complete
  const results = await Promise.all(promises) as PrefetchResult[];
  console.log(`Completed parallel prefetch of ${urls.length} samples`);
  
  return results;
}