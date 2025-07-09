import fs from 'fs';
import path from 'path';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import replace from '@rollup/plugin-replace';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import solidPlugin from 'vite-plugin-solid';
/// <reference types="vitest" />


export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  

  const define: Record<string, string> = {
    // for tonejs's very persistent logger (dev server)
    'TONE_SILENCE_LOGGING': JSON.stringify(true),
    // for our logger
    'window.LOG_LEVEL': JSON.stringify(isProduction ? 'error' : 'debug'),
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.API_URL': JSON.stringify(isProduction ? '/api' : 'http://localhost:3001/api'),
    'process.env.SERVICE_WORKER_PATH': JSON.stringify('/assets/serviceWorker.js'),
  };

  if (!isProduction) {
    // for simple-peer's reliance on node polyfills (browserify)
    define.global = 'self';
  }

  return {
    plugins: [
      vanillaExtractPlugin(),
      solidPlugin(),
      // for simple-peer
      nodePolyfills({
        globals: {
          process: true,
          global: true,
        }
      }),
      {
        name: 'serve-service-worker',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/assets/serviceWorker.js') {
              const filePath = path.join(__dirname, 'dist', 'assets', 'serviceWorker.js');
              
              if (fs.existsSync(filePath)) {
                res.setHeader('Content-Type', 'application/javascript');
                res.setHeader('Cache-Control', 'no-cache');
                res.end(fs.readFileSync(filePath, 'utf-8'));
              } else {
                res.statusCode = 404;
                res.end('Service worker not found. Please run build first.');
              }
              return;
            }
            next();
          });
        },
      },
    ],
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          // for simple-peer (browserify)
          NodeGlobalsPolyfillPlugin({ process: true }),
        ]
      }
    },
    define,
    test: {
      environment: 'happy-dom',
      globals: true,
      setupFiles: ['src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'json-summary'],
        exclude: [
          'node_modules/**',
          'dist/**',
          'html/**',
          'coverage/**',
          'scripts/**',
          '**/*.d.ts',
          '**/*.config.*',
          '**/*.css.ts',
          '**/index.tsx',
          '**/index.ts',
          'src/styles/**',
          'src/test-utils/**',
          'src/workers/serviceWorker.ts',
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/*.spec.ts',
          '**/*.spec.tsx',
          'integration-tests/**',
        ],
        thresholds: {
          lines: 70,
          functions: 80,
          branches: 80,
          statements: 70
        },
      },
    },
    build: {
      sourcemap: 'hidden',
      rollupOptions: {
        input: {
          main: './index.html',
          serviceWorker: './src/workers/serviceWorker.ts',
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'serviceWorker') {
              return 'assets/serviceWorker.js';
            }
            return 'assets/[name]-[hash].js';
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        },
        // DANGER: this is simple string replacement in build, use with extreme caution
        plugins: replace({
          preventAssignment: true,
          // for tonejs's very persistent logger (prod build)
          'theWindow.TONE_SILENCE_LOGGING': true,
        }),
      },
      outDir: 'dist',
    },
  };
});
