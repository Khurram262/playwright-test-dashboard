import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',

  testMatch: [
    '**/*.spec.js',
    '**/*.test.js',
    '**/*.spec.ts',
    '**/*.test.ts'
  ],

  timeout: 60 * 1000,
  retries: 0,

  use: {
    trace: 'on-first-retry'
  },

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['./reporter/customReporter.js'] // ✅ FIX
  ],

  outputDir: 'test-results'
});
