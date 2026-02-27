import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * 
 * This configuration sets up the test environment for DEX Manager Content Management testing.
 * Includes parallel execution, retry logic, and reporting configuration.
 */
export default defineConfig({
  // Test directory
  testDir: './src/tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],

  // Global settings
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'https://demo4.dexmanager.com/',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Global timeout for each action
    actionTimeout: 30000,

    // Global timeout for navigation
    navigationTimeout: 60000,

    // Storage state to use for all tests
    storageState: 'auth/storageState.json',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /*     {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        }, */
  ],

  /*
  // Run your local dev server before starting the tests
  webServer: {
    command: 'echo "No local server needed for DEX Manager testing"',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  */

  // Test timeout
  timeout: 120000, // 2 minutes per test

  // Global setup and teardown
  globalSetup: require.resolve('./src/config/global-setup.ts'),
  globalTeardown: require.resolve('./src/config/global-teardown.ts'),
});
