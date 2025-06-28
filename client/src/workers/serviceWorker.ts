/**
 * Service Worker for intercepting and caching audio requests
 */

const CACHE_NAME = 'p2piano-audio-v1';

self.addEventListener('install', () => {
  console.log('Audio Service Worker: Installing');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Audio Service Worker: Activating');
  self.clients.claim();
});

// Fetch event - intercept audio requests
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = event.request.url;
  
  // Only handle .mp3 audio requests
  if (!url.endsWith('.mp3')) {
    return;
  }
  
  event.respondWith(handleAudioRequest(event.request));
});

async function handleAudioRequest(request: Request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Check cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Cache hit for', request.url);
      return cachedResponse;
    }
    
    // Fetch and cache
    console.log('Service Worker: Fetching and caching', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Service Worker: Failed to fetch', request.url, error);
    throw error;
  }
}