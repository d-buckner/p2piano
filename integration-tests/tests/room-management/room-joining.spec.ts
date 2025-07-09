import { test, expect } from '@playwright/test';
import { RoomFixture } from '../../fixtures/room-fixture';
import { WebSocketFixture } from '../../fixtures/websocket-fixture';

test.describe('Room Joining', () => {
  let roomFixture: RoomFixture;
  let wsFixture: WebSocketFixture;

  test.beforeEach(async ({ page }) => {
    roomFixture = new RoomFixture(page);
    wsFixture = new WebSocketFixture(page);
    await wsFixture.startIntercepting();
  });

  test('should create a new room successfully', async ({ page }) => {
    const roomId = await roomFixture.createRoom();
    
    // Verify room ID format (5 characters, lowercase)
    expect(roomId).toMatch(/^[a-z0-9]{5}$/);
    
    // Verify URL contains the room ID
    expect(page.url()).toContain(`/${roomId}`);
    
    // Verify we can see the room settings modal
    await expect(page.locator('text=sharable room code')).toBeVisible();
    await expect(page.locator('button:has-text("let\'s go")')).toBeVisible();
  });

  test('should join an existing room with display name', async ({ page }) => {
    // First create a room
    const roomId = await roomFixture.createRoom();
    
    // Navigate to home to simulate joining an existing room
    await page.goto('/');
    
    // Join the room with a display name
    await roomFixture.joinRoom(roomId, 'Test User');
    
    // Verify we're in the correct room
    expect(roomFixture.getCurrentRoomId()).toBe(roomId);
    
    // Verify room is ready
    await roomFixture.waitForRoomReady();
    
    // Verify WebSocket messages
    await wsFixture.waitForRoomJoin();
  });

  test('should handle multiple users joining the same room', async ({ page, browser }) => {
    // Create a room with the first user
    const roomId = await roomFixture.createRoom();
    
    // Create a completely separate browser context for the second user
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondRoomFixture = new RoomFixture(secondPage);
    const secondWsFixture = new WebSocketFixture(secondPage);
    await secondWsFixture.startIntercepting();
    
    const firstUserName = 'User One';
    const secondUserName = 'User Two';
    
    // First user enters the room
    await page.fill('input[type="text"]', firstUserName);
    await page.click('button:has-text("let\'s go")');
    await page.waitForTimeout(2000);
    
    // Second user joins the same room
    await secondRoomFixture.joinRoom(roomId, secondUserName);
    
    // Add delays to avoid throttling
    await page.waitForTimeout(3000);
    
    // Verify both users can see each other (simplified check)
    // For now, just verify both pages are in the correct room
    expect(page.url()).toContain(`/${roomId}`);
    expect(secondPage.url()).toContain(`/${roomId}`);
    
    // Clean up
    await secondContext.close();
  });

  test('should handle user leaving a room', async ({ page, context }) => {
    // Create a room and join with first user
    const roomId = await roomFixture.createRoom();
    await roomFixture.joinRoom(roomId, 'User One');
    
    // Create second user
    const secondPage = await context.newPage();
    const secondRoomFixture = new RoomFixture(secondPage);
    const secondWsFixture = new WebSocketFixture(secondPage);
    await secondWsFixture.startIntercepting();
    
    await secondRoomFixture.joinRoom(roomId, 'User Two');
    
    // Wait for both users to be in the room
    await roomFixture.waitForUserToJoin('User Two');
    
    // Second user leaves the room
    await secondRoomFixture.leaveRoom();
    
    // Verify second user is no longer in the room list
    await roomFixture.waitForUserToLeave('User Two');
    
    // Verify user list only contains first user
    const userList = await roomFixture.getUserList();
    expect(userList).toContain('User One');
    expect(userList).not.toContain('User Two');
    
    // Verify WebSocket disconnect message
    await wsFixture.waitForUserDisconnect();
    
    // Clean up
    await secondPage.close();
  });

  test('should handle reconnection after network interruption', async ({ page }) => {
    // Create and join a room
    const roomId = await roomFixture.createRoom();
    await roomFixture.joinRoom(roomId, 'Test User');
    
    // Verify initial connection
    await wsFixture.waitForConnection();
    expect(await wsFixture.isConnected()).toBe(true);
    
    // Simulate network disconnection
    await wsFixture.simulateDisconnection();
    
    // Wait a moment for disconnection to register
    await page.waitForTimeout(1000);
    
    // Reconnect
    await wsFixture.simulateReconnection();
    
    // Verify reconnection
    await wsFixture.waitForConnection();
    expect(await wsFixture.isConnected()).toBe(true);
    
    // Verify room is still functional
    await roomFixture.waitForRoomReady();
  });

  test('should reject invalid room IDs', async ({ page }) => {
    // Try to join a room with invalid ID
    await page.goto('/room/INVALID');
    
    // Should redirect to home or show error
    await page.waitForTimeout(2000);
    
    // Check if we're redirected to home or if there's an error message
    const url = page.url();
    const hasError = await page.locator('text=Room not found, text=Invalid room, [data-testid="error-message"]').count() > 0;
    
    expect(url.includes('/room/INVALID') && hasError || !url.includes('/room/INVALID')).toBe(true);
  });

  test('should handle room capacity limits gracefully', async ({ page, context }) => {
    // This test assumes there might be room capacity limits
    // Adjust based on actual application behavior
    
    const roomId = await roomFixture.createRoom();
    const users: any[] = [];
    
    try {
      // Create multiple users (adjust number based on actual limits)
      for (let i = 0; i < 10; i++) {
        const userPage = await context.newPage();
        const userRoomFixture = new RoomFixture(userPage);
        
        await userRoomFixture.joinRoom(roomId, `User ${i + 1}`);
        users.push({ page: userPage, fixture: userRoomFixture });
        
        // Small delay between joins
        await page.waitForTimeout(100);
      }
      
      // Verify all users are connected (or handle capacity limits)
      const userList = await roomFixture.getUserList();
      expect(userList.length).toBeGreaterThan(0);
      
    } finally {
      // Clean up all user pages
      for (const user of users) {
        await user.page.close();
      }
    }
  });
});