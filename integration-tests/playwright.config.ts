import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for p2piano integration tests
 * 
 * Focuses on testing real-time collaborative features with multiple users,
 * WebSocket connections, and cross-browser compatibility.
 */
export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Global setup and teardown (commented out for now)
  // globalSetup: './config/global-setup.ts',
  // globalTeardown: './config/global-teardown.ts',

  // Run tests in files in parallel
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: 1,

  // Reporter configuration
  reporter: [
    ['json', { outputFile: 'test-results/results.json' }],
    ['line']
  ],

  // Global test configuration
  use: {
    // Base URL for the application
    baseURL: 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video recording
    video: 'retain-on-failure',

    // Increased timeout for real-time operations
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Test timeout
  timeout: 60000,

  // Expect timeout for assertions
  expect: {
    timeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile testing for touch interactions
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web server configuration for local development
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
    cwd: '..',
  },

  // Output directories
  outputDir: 'test-results',
});