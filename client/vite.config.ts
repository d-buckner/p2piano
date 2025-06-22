import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import replace from '@rollup/plugin-replace';


export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
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
    define: {
      // for tonejs's very persistent logger (dev server)
      'TONE_SILENCE_LOGGING': JSON.stringify(true),
      'window.LOG_LEVEL': JSON.stringify(isProduction ? 'error' : 'debug'),
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.API_URL': JSON.stringify(isProduction ? '/api' : 'http://localhost:3001/api'),
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`
        },
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
