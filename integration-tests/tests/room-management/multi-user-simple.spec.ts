import { test, expect } from '@playwright/test';
import { RoomFixture } from '../../fixtures/room-fixture';

test.describe('Multi-User Simple Tests', () => {
  test('should create separate rooms with different browser contexts', async ({ browser }) => {
    // Create first user in separate context
    const firstContext = await browser.newContext();
    const firstPage = await firstContext.newPage();
    const firstRoomFixture = new RoomFixture(firstPage);
    
    // Create first room
    const firstRoomId = await firstRoomFixture.createRoom();
    
    // Add delay to avoid rate limiting
    await firstPage.waitForTimeout(3000);
    
    // Create second user in separate context  
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondRoomFixture = new RoomFixture(secondPage);
    
    // Create second room
    const secondRoomId = await secondRoomFixture.createRoom();
    
    // Verify both rooms were created with different IDs
    expect(firstRoomId).toMatch(/^[a-z0-9]{5}$/);
    expect(secondRoomId).toMatch(/^[a-z0-9]{5}$/);
    expect(firstRoomId).not.toBe(secondRoomId);
    
    // Verify each user is in their respective room
    expect(firstPage.url()).toContain(`/${firstRoomId}`);
    expect(secondPage.url()).toContain(`/${secondRoomId}`);
    
    // Clean up contexts
    await firstContext.close();
    await secondContext.close();
  });

  test('should have separate sessions for different contexts', async ({ browser }) => {
    // Create two separate browser contexts
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Navigate both to home page
    await page1.goto('/');
    await page2.goto('/');
    
    // Both should see the home page independently
    await expect(page1.locator('button:has-text("create room")')).toBeVisible();
    await expect(page2.locator('button:has-text("create room")')).toBeVisible();
    
    // Clean up
    await context1.close();
    await context2.close();
  });

  test('should allow two users to join the same room', async ({ browser }) => {
    // Create first user and room
    const firstContext = await browser.newContext();
    const firstPage = await firstContext.newPage();
    const firstRoomFixture = new RoomFixture(firstPage);
    
    const roomId = await firstRoomFixture.createAndEnterRoom('Player One');
    
    // Add delay to avoid rate limiting
    await firstPage.waitForTimeout(3000);
    
    // Create second user in separate context
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondRoomFixture = new RoomFixture(secondPage);
    
    // Second user joins the same room
    await secondRoomFixture.joinRoom(roomId, 'Player Two');
    
    // Verify both users are in the same room
    expect(firstPage.url()).toContain(`/${roomId}`);
    expect(secondPage.url()).toContain(`/${roomId}`);
    
    // Clean up
    await firstContext.close();
    await secondContext.close();
  });
});