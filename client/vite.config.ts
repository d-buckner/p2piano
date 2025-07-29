import fs from 'fs';
import path from 'path';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import replace from '@rollup/plugin-replace';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import solidPlugin from 'vite-plugin-solid';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
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
      // for Automerge WASM support
      wasm(),
      topLevelAwait(),
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
      modulePreload: {
        polyfill: false,
        resolveDependencies: (url, deps, context) => {
          // Preload critical chunks for better performance
          if (context.hostType === 'html') {
            return deps.filter(dep => 
              dep.includes('Home-') || 
              dep.includes('HomeLayout-') || 
              dep.includes('RoomActions-') ||
              dep.includes('Footer-')
            );
          }
          return [];
        }
      },
      rollupOptions: {
        input: {
          main: './index.html',
          about: './about.html',
          donate: './donate.html',
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
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: (id) => {
            // Separate heavy vendor libraries that are actually used
            if (id.includes('node_modules/tone')) {
              return 'vendor-tone';
            }
            if (id.includes('node_modules/@automerge')) {
              return 'vendor-crdt';
            }
            if (id.includes('node_modules/solid-js')) {
              return 'vendor-solid';
            }
            // Group critical home components
            if (id.includes('/pages/Home.') || 
                id.includes('/components/HomeLayout.') || 
                id.includes('/components/Footer.')) {
              return 'home-critical';
            }
          }
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
