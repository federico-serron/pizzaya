import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_PROXY_TARGET allows overriding the API backend in Docker
// e.g., VITE_PROXY_TARGET=http://backend:8000 in docker-compose
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
});
