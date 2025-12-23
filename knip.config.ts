import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/main.tsx',
    'vite.config.ts',
    'vitest.config.ts',
    'postcss.config.js',
    'tailwind.config.js',
    'eslint.config.js',
    'scripts/**/*.{js,cjs}',
    'api/**/*.js',
  ],
  project: ['src/**/*.{ts,tsx}', 'api/**/*.js', 'scripts/**/*.{js,cjs}'],
  ignore: [
    'src/**/*.test.{ts,tsx}',
    'src/test/**',
    'coverage/**',
    'dist/**',
    'node_modules/**',
    '.github/workflows/**',
    // Container component is exported but not currently used - keeping for potential future use
    'src/components/ui/Container.tsx',
    // Index file is not used but keeps exports organized
    'src/components/ui/index.ts',
  ],
  ignoreDependencies: [],
  ignoreBinaries: [],
  // Ignore specific exports that are used but knip doesn't detect properly
  ignoreIssues: {
    'src/components/dragboard/index.ts': ['exports'],
    'src/contexts/constants.ts': ['exports'],
    'src/components/tile-implementations/weather/config.ts': ['exports'],
    // Ignore all exported types - they're used in type annotations which knip doesn't detect well
    'src/**/*.ts': ['types'],
    'src/**/*.tsx': ['types'],
  },
  vite: {
    config: 'vite.config.ts',
  },
  vitest: {
    config: 'vitest.config.ts',
  },
};

export default config;
