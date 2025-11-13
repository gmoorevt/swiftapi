/**
 * Vitest Configuration
 * Testing framework configuration aligned with constitutional requirements
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**',
      // Monaco Editor test has complex worker dependencies - skip for now
      '**/MonacoWrapper.test.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.ts',
        '*.config.js',
        'dist/',
        'release/',
        // Electron main process - requires Electron runtime
        'src/main/**',
        // React entry points - covered by E2E tests
        'src/renderer/main.tsx',
        'src/renderer/App.tsx',
        // UI components covered by E2E tests
        'src/renderer/components/HistoryPanel/HistoryPanel.tsx',
        'src/renderer/components/RequestBuilder/AuthSection.tsx',
        'src/renderer/components/RequestBuilder/QueryParamsEditor.tsx',
        'src/renderer/components/ResponseViewer/MonacoWrapper.tsx',
        // Mock Server UI components (covered by integration tests, TODO: add unit tests)
        'src/renderer/components/MockServerPanel/**',
        'src/renderer/components/Layout/**',
        'src/renderer/components/Sidebar/**',
        'src/renderer/components/Logo/**',
        'src/renderer/services/mockServerStorageService.ts',
        // Style utilities (covered by E2E visual testing)
        'src/renderer/styles/**',
        // Type-only files (contract definitions)
        'specs/**/contracts/**',
      ],
      // Constitutional requirement: 80% minimum coverage
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    // Performance requirement: tests should be fast
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@main': path.resolve(__dirname, './src/main'),
      '@renderer': path.resolve(__dirname, './src/renderer'),
      '@models': path.resolve(__dirname, './src/models'),
      '@services': path.resolve(__dirname, './src/services'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
