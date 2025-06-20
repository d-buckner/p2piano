import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
    TONE_SILENCE_LOGGING: true,
    LOG_LEVEL: isProduction ? '"error"' : '"debug"',
    'process.env': {
      NODE_ENV: isProduction ? 'production' : 'development',
      API_URL: isProduction
          ? '/api'
          : 'http://localhost:3001/api'
    }
  },
  build: {
    outDir: 'dist',
  }
})
