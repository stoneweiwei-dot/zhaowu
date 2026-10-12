import { defineConfig } from '@playwright/test';

// Theme acceptance only. Existing Safari/PWA/Visual Regression suites stay manual.
export default defineConfig({
  testDir: './e2e',
  testMatch: 'theme-acceptance.spec.ts',
  workers: 2,
  fullyParallel: true,
  timeout: 90_000,
  retries: 0,
  reporter: [['line'], ['json', { outputFile: 'theme-results/results.json' }]],
  outputDir: 'theme-results/test-output',
  use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium', serviceWorkers: 'block', reducedMotion: 'reduce', screenshot: 'only-on-failure' },
  projects: [
    { name: 'mobile-hant', use: { viewport: { width: 390, height: 844 }, locale: 'zh-TW' } },
    { name: 'mobile-en', use: { viewport: { width: 390, height: 844 }, locale: 'en-AU' } },
    { name: 'desktop-hant', use: { viewport: { width: 1440, height: 900 }, locale: 'zh-TW' } },
  ],
  webServer: { command: 'npm exec vite -- preview --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173', timeout: 60_000, reuseExistingServer: !process.env.CI },
});
