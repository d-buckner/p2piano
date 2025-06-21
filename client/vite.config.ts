import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import replace from '@rollup/plugin-replace';


export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  return {
    plugins: [react()],
    define: {
      global: {},
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
          'theWindow.TONE_SILENCE_LOGGING': true,
        }),
      },
      outDir: 'dist',
    }
  }
});
