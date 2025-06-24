import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import replace from '@rollup/plugin-replace';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';


export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const define: Record<string, string> = {
    // for tonejs's very persistent logger (dev server)
    'TONE_SILENCE_LOGGING': JSON.stringify(true),
    // for our logger
    'window.LOG_LEVEL': JSON.stringify(isProduction ? 'error' : 'debug'),
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.API_URL': JSON.stringify(isProduction ? '/api' : 'http://localhost:3001/api'),
  }

  if (!isProduction) {
    // for simple-peer's reliance on node polyfills (browserify)
    define.global = 'window';
  }

  return {
    plugins: [
      react(),
      // for simple-peer
      nodePolyfills({
        globals: {
          process: true,
          global: true,
        }
      })
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
    build: {
      sourcemap: 'hidden',
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`
        },
        // DANGER: this is simple string replacement in build, use with extreme caution
        plugins: replace({
          preventAssignment: true,
          // for tonejs's very persistent logger (prod build)
          'theWindow.TONE_SILENCE_LOGGING': true,
        }),
      },
      outDir: 'dist',
    }
  }
});
