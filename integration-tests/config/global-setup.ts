import { chromium, type FullConfig } from '@playwright/test';

/**
 * Global setup for integration tests
 * 
 * Ensures the application is ready before running tests:
 * - Starts development servers
 * - Verifies services are healthy
 * - Sets up test environment
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting P2Piano integration test setup...');
  
  // Launch a browser to verify the application is ready
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for client to be ready
    console.log('⏳ Waiting for client application...');
    await page.goto('http://localhost:5173');
    await page.waitForSelector('body', { timeout: 30000 });
    
    // Verify service health endpoint
    console.log('⏳ Verifying service health...');
    const healthResponse = await page.goto('http://localhost:3001/health');
    if (!healthResponse?.ok()) {
      throw new Error('Service health check failed');
    }
    
    console.log('✅ Application is ready for testing');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;