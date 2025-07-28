import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // API proxying is now handled by Vercel API functions in /api directory
  // This ensures consistent behavior across all environments
  server: {
    port: 3000,
    host: true,
  },
  publicDir: 'public',
  build: {
    target: 'esnext',
    modulePreload: {
      polyfill: false,
    },
  },
});
