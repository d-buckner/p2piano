import * as path from 'path';
import { build, type Plugin } from 'vite';


export function serviceWorkerDevPlugin(): Plugin {
  let cachedServiceWorker: string | null = null;

  return {
    name: 'service-worker-dev',
    configureServer(server) {
      server.middlewares.use('/assets/serviceWorker.js', async (req, res, next) => {
        try {
          if (!cachedServiceWorker) {
            // Build the service worker as IIFE
            const result = await build({
              configFile: false,
              build: {
                write: false,
                lib: {
                  entry: path.resolve(process.cwd(), 'src/workers/serviceWorker.ts'),
                  formats: ['iife'],
                  name: 'ServiceWorker'
                },
                rollupOptions: {
                  output: {
                    format: 'iife'
                  }
                }
              }
            });

            if (Array.isArray(result)) {
              const output = result[0];
              if ('output' in output) {
                cachedServiceWorker = output.output[0].code;
              }
            }
          }

          if (cachedServiceWorker) {
            res.setHeader('Content-Type', 'application/javascript');
            res.end(cachedServiceWorker);
          } else {
            next();
          }
        } catch (error) {
          console.error('Service worker build error:', error);
          next(error);
        }
      });

      // Clear cache on file changes
      server.watcher.on('change', (file) => {
        if (file.includes('serviceWorker.ts')) {
          cachedServiceWorker = null;
        }
      });
    }
  };
}