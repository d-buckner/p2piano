import { defineConfig } from 'vitest/config';

/**
 * Shared Vitest configuration for both client and service.
 * This reduces duplication and ensures consistent test behavior across the project.
 */
export const createSharedConfig = (options: {
  environment?: 'node' | 'happy-dom';
  setupFiles?: string[];
  include?: string[];
  exclude?: string[];
  coverageInclude?: string[];
  coverageExclude?: string[];
  coverageThresholds?: {
    lines?: number;
    functions?: number;
    branches?: number;
    statements?: number;
  };
}) => {
  const {
    environment = 'node',
    setupFiles = [],
    include = ['src/**/*.{test,spec}.{js,ts,tsx}'],
    exclude = ['node_modules/**', 'dist/**', 'coverage/**'],
    coverageInclude = ['src/**/*.{js,ts,tsx}'],
    coverageExclude = [
      'src/**/*.{test,spec}.{js,ts,tsx}',
      'src/**/*.d.ts',
      '**/*.config.*',
    ],
    coverageThresholds = {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  } = options;

  return defineConfig({
    test: {
      globals: true,
      environment,
      setupFiles,
      include,
      exclude,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html', 'json', 'json-summary'],
        reportsDirectory: './coverage',
        include: coverageInclude,
        exclude: coverageExclude,
        thresholds: {
          global: coverageThresholds,
        },
        all: true,
        watermarks: {
          statements: [50, 80],
          functions: [50, 80],
          branches: [50, 80],
          lines: [50, 80],
        },
      },
    },
    resolve: {
      alias: {
        '@': './src',
      },
    },
  });
};

/**
 * Default configurations for common project types
 */
export const configs = {
  // Backend/Service configuration (Node.js)
  backend: (overrides = {}) => createSharedConfig({
    environment: 'node',
    setupFiles: ['./src/test-utils/vitest.setup.ts'],
    coverageExclude: [
      'src/**/*.{test,spec}.{js,ts}',
      'src/test-utils/**',
      'src/main.ts',
      'src/**/*.d.ts',
      '**/*.config.*',
    ],
    coverageThresholds: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    ...overrides,
  }),

  // Frontend/Client configuration (Browser-like)
  frontend: (overrides = {}) => createSharedConfig({
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    coverageInclude: ['src/**/*.{js,ts,tsx}'],
    coverageExclude: [
      'src/**/*.{test,spec}.{js,ts,tsx}',
      'src/**/*.d.ts',
      '**/*.config.*',
      '**/*.css.ts',
      '**/index.tsx',
      '**/index.ts',
      'src/styles/**',
      'src/workers/serviceWorker.ts',
    ],
    coverageThresholds: {
      lines: 25,    // Client has lower thresholds currently
      functions: 53,
      branches: 74,
      statements: 25,
    },
    ...overrides,
  }),
};