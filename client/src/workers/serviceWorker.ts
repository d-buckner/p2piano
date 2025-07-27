/**
 * Service Worker for intercepting and caching audio requests
 */

const CACHE_NAME = 'p2piano-audio-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

// Fetch event - intercept audio requests
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = event.request.url;
  
  // Only handle .mp3 and .ogg audio requests
  if (!/\.(mp3|ogg)$/i.test(url)) {
    return;
  }
  
  event.respondWith(handleAudioRequest(event.request));
});

async function handleAudioRequest(request: Request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const response = await fetch(request);
  
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  
  return response;
}
