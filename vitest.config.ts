import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    testTimeout: 10000,
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/__mocks__/**',
        '**/*.d.ts',
        // Exclude presentational and integration-heavy UI to focus coverage on core logic
        'src/components/dragboard/**',
        'src/components/sidebar/**',
        'src/components/overlay/**',
        'src/components/ui/**',
        'src/components/tile-implementations/**',
        'src/components/tile/GenericTile.tsx',
        'src/components/tile/LoadingComponent.tsx',
        'src/components/tile/Tile.tsx',
        'src/components/tile/TileErrorBoundary.tsx',
        'src/components/tile/TileFactoryRegistry.ts',
        'src/main.tsx',
        'src/theme-init.ts',
        'src/i18n/**',
        'src/types/**',
        'src/theme/**',
        // Exclude context providers (mostly React wiring) to focus on logic units
        'src/contexts/**',
      ],
    },
  },
});
