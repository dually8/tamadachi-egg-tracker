import { defineConfig, devices } from '@playwright/test';

const isLinuxArm64 = process.platform === 'linux' && process.arch === 'arm64';
const isWindows = process.platform === 'win32';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  timeout: isLinuxArm64 ? 100_000 : 60_000,
  expect: {
    timeout: isLinuxArm64 ? 90_000 : 10_000,
  },
  workers: process.env.CI || isLinuxArm64 ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    actionTimeout: isLinuxArm64 ? 90_000 : 10_000,
    navigationTimeout: isLinuxArm64 ? 100_000 : 30_000,
    headless: true,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    ...(isLinuxArm64
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
          },
        ]
      : []),
    ...(isWindows
      ? [
          {
            name: 'Microsoft Edge',
            use: { ...devices['Desktop Edge'], channel: 'msedge' as const },
          },
        ]
      : []),
  ],
});
