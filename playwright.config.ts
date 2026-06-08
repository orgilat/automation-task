import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const BASE_URL = process.env.BASE_URL || 'https://takenote.dev/app';
const IS_CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 4 : 10,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    [
      'allure-playwright',
      {
        detail: true,
        outputFolder: 'allure-results',
        suiteTitle: false,
        environmentInfo: {
          baseURL: BASE_URL,
          ci: String(IS_CI),
          node: process.version,
        },
      },
    ],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    timezoneId: 'UTC',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results',
});
