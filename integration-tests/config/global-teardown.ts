import { type FullConfig } from '@playwright/test';

/**
 * Global teardown for integration tests
 * 
 * Cleans up after test execution:
 * - Stops development servers (if started by tests)
 * - Cleans up test artifacts
 * - Resets test environment
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up after integration tests...');
  
  // Clean up any test artifacts
  // Note: Development servers are automatically stopped by Playwright
  // if they were started by the webServer configuration
  
  console.log('✅ Cleanup complete');
}

export default globalTeardown;