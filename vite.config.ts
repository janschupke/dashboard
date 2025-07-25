import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // API proxying is now handled by Vercel API functions in /api directory
  // This ensures consistent behavior across all environments
  server: {
    port: 3000,
    host: true,
  },
  assetsInclude: ['**/*.html'],
});
