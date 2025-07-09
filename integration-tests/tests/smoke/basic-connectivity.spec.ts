import { test, expect } from '@playwright/test';

test.describe('Basic Connectivity', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForSelector('body');
    
    // Check that the page title is correct
    await expect(page).toHaveTitle(/p2piano/i);
    
    // Check for key elements on the home page
    await expect(page.locator('h2:has-text("p2piano")')).toBeVisible();
    await expect(page.locator('text=a collaboration space for the musically inclined')).toBeVisible();
    await expect(page.locator('button:has-text("create room")')).toBeVisible();
    await expect(page.locator('button:has-text("join room code")')).toBeVisible();
  });

  test('should create a room successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the home page to load
    await page.waitForSelector('button:has-text("create room")');
    
    // Click create room button
    await page.click('button:has-text("create room")');
    
    // Wait for navigation to complete (should go to room)
    await page.waitForTimeout(5000);
    
    const url = page.url();
    
    // Test should only pass if we successfully navigate to a room
    // If databases aren't available, this test should fail
    expect(url).toMatch(/\/[a-z0-9]{5}$/);
  });

  test('should have working service health endpoint', async ({ page }) => {
    const response = await page.goto('/api/health');
    expect(response?.status()).toBe(200);
  });
});