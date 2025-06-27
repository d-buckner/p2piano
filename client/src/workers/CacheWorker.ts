/**
 * CacheWorker - Handles heavy cache operations off the main thread
 */

interface CacheOperation {
  id: string;
  type: 'BATCH_CACHE' | 'ANALYZE_CACHE' | 'CLEANUP_CACHE' | 'PREFETCH_URLS';
  data: {
    samples?: Array<{ url: string; size: string; cachedDate: number }>;
    urls?: string[];
    batchSize?: number;
    maxAgeMs?: number;
  };
}

interface CacheResult {
  id: string;
  result: Record<string, unknown> | null;
  error?: string;
  stats?: {
    processed: number;
    cached: number;
    errors: number;
    totalSize: number;
    processingTime: number;
  };
}

// Cache analysis functions
function analyzeCacheUsage(samples: Array<{ url: string; size: string; cachedDate: number }>) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  
  let totalSize = 0;
  
  const sizeByVelocity: Record<string, number> = {};
  const ageDistribution = {
    fresh: 0,    // < 1 day
    recent: 0,   // 1-7 days  
    old: 0       // > 7 days
  };
  
  samples.forEach(sample => {
    const size = parseInt(sample.size, 10) || 0;
    totalSize += size;
    
    const age = now - sample.cachedDate;
    if (age < oneDay) {
      ageDistribution.fresh++;
    } else if (age < oneWeek) {
      ageDistribution.recent++;
    } else {
      ageDistribution.old++;
    }
    
    // Extract velocity from filename (e.g., A0v4.mp3 -> v4)
    const velocityMatch = sample.url.match(/v(\d+)\.mp3$/);
    if (velocityMatch) {
      const velocity = `v${velocityMatch[1]}`;
      sizeByVelocity[velocity] = (sizeByVelocity[velocity] || 0) + size;
    }
  });
  
  return {
    totalSamples: samples.length,
    totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
    ageDistribution,
    sizeByVelocity,
    recommendations: generateCacheRecommendations(samples, totalSize, ageDistribution)
  };
}

function generateCacheRecommendations(
  samples: Array<{ url: string; size: string; cachedDate: number }>, 
  totalSize: number, 
  ageDistribution: { fresh: number; recent: number; old: number }
) {
  const recommendations = [];
  
  // Size recommendations
  if (totalSize > 200 * 1024 * 1024) { // > 200MB
    recommendations.push({
      type: 'size',
      message: 'Cache size is large. Consider cleaning old samples.',
      action: 'cleanup_old_samples'
    });
  }
  
  // Age recommendations
  if (ageDistribution.old > samples.length * 0.3) {
    recommendations.push({
      type: 'age',
      message: 'Many old samples in cache. Consider refresh.',
      action: 'refresh_old_samples'
    });
  }
  
  // Performance recommendations
  if (samples.length > 1000) {
    recommendations.push({
      type: 'performance',
      message: 'Large number of cached samples may impact performance.',
      action: 'implement_lru_eviction'
    });
  }
  
  return recommendations;
}

function prioritizePrefetchUrls(urls: string[]): string[] {
  // Sort URLs by priority (lower velocity numbers first)
  return urls.sort((a, b) => {
    const aVelocity = parseInt(a.match(/v(\d+)\.mp3$/)?.[1] || '99', 10);
    const bVelocity = parseInt(b.match(/v(\d+)\.mp3$/)?.[1] || '99', 10);
    return aVelocity - bVelocity;
  });
}

async function batchCacheUrls(urls: string[], batchSize: number = 5) {
  const results = {
    cached: 0,
    alreadyCached: 0,
    errors: 0,
    totalSize: 0
  };
  
  // Process in smaller batches to avoid overwhelming the browser
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchPromises = batch.map(async (url) => {
      try {
        // Check if already cached
        const cache = await caches.open('p2piano-audio-samples-v1');
        const cached = await cache.match(url);
        
        if (cached) {
          results.alreadyCached++;
          return { url, status: 'already-cached' };
        }
        
        // Fetch and cache
        const response = await fetch(url);
        if (response.ok) {
          const size = parseInt(response.headers.get('content-length') || '0', 10);
          results.totalSize += size;
          
          const responseToCache = response.clone();
          const headers = new Headers(responseToCache.headers);
          headers.set('sw-cached-date', Date.now().toString());
          
          const cacheResponse = new Response(responseToCache.body, {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers
          });
          
          await cache.put(url, cacheResponse);
          results.cached++;
          return { url, status: 'cached', size };
        } else {
          results.errors++;
          return { url, status: 'error', error: `HTTP ${response.status}` };
        }
      } catch (error) {
        results.errors++;
        return { url, status: 'error', error };
      }
    });
    
    await Promise.all(batchPromises);
  }
  
  return results;
}

// Main worker message handler
self.onmessage = async function(event: MessageEvent<CacheOperation>) {
  const { id, type, data } = event.data;
  const startTime = performance.now();
  
  try {
    let result: Record<string, unknown>;
    let stats: Record<string, unknown> = {};
    
    switch (type) {
      case 'ANALYZE_CACHE': {
        if (!data.samples) throw new Error('Missing samples data');
        result = analyzeCacheUsage(data.samples);
        stats = {
          processed: data.samples.length,
          processingTime: performance.now() - startTime
        };
        break;
      }
        
      case 'PREFETCH_URLS': {
        if (!data.urls) throw new Error('Missing urls data');
        const prioritizedUrls = prioritizePrefetchUrls(data.urls);
        const batchResult = await batchCacheUrls(prioritizedUrls, data.batchSize || 5);
        result = batchResult;
        stats = {
          processed: data.urls.length,
          ...batchResult,
          processingTime: performance.now() - startTime
        };
        break;
      }
        
      case 'CLEANUP_CACHE': {
        // Implement cache cleanup logic
        const cache = await caches.open('p2piano-audio-samples-v1');
        const keys = await cache.keys();
        let cleanedCount = 0;
        
        for (const request of keys) {
          const response = await cache.match(request);
          const cachedDate = response?.headers.get('sw-cached-date');
          
          if (cachedDate) {
            const age = Date.now() - parseInt(cachedDate, 10);
            const maxAge = data.maxAgeMs || (30 * 24 * 60 * 60 * 1000); // 30 days default
            
            if (age > maxAge) {
              await cache.delete(request);
              cleanedCount++;
            }
          }
        }
        
        result = { cleanedCount };
        stats = {
          processed: keys.length,
          cleaned: cleanedCount,
          processingTime: performance.now() - startTime
        };
        break;
      }
        
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
    
    const response: CacheResult = {
      id,
      result,
      stats
    };
    
    self.postMessage(response);
    
  } catch (error) {
    const response: CacheResult = {
      id,
      result: null,
      error: String(error),
      stats: {
        processed: 0,
        cached: 0,
        errors: 1,
        totalSize: 0,
        processingTime: performance.now() - startTime
      }
    };
    
    self.postMessage(response);
  }
};

// Handle worker startup
self.postMessage({ type: 'CACHE_WORKER_READY' });