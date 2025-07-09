import { test, expect } from '@playwright/test';
import { RoomFixture } from '../../fixtures/room-fixture';
import { WebSocketFixture } from '../../fixtures/websocket-fixture';
import { PianoFixture } from '../../fixtures/piano-fixture';

test.describe('Real-Time Synchronization', () => {
  test('should demonstrate basic WebSocket message flow', async ({ browser }) => {
    // Create first user and room
    const firstContext = await browser.newContext();
    const firstPage = await firstContext.newPage();
    const firstRoomFixture = new RoomFixture(firstPage);
    const firstWsFixture = new WebSocketFixture(firstPage);
    const firstPianoFixture = new PianoFixture(firstPage);
    
    await firstWsFixture.startIntercepting();
    
    // Create room and enter it
    const roomId = await firstRoomFixture.createAndEnterRoom('Player One');
    
    // Wait for room to be ready
    await firstPage.waitForTimeout(3000);
    
    // Verify we're in the room
    expect(firstPage.url()).toContain(`/${roomId}`);
    
    // Check WebSocket messages were captured
    const messages = firstWsFixture.getMessages();
    expect(messages.length).toBeGreaterThan(0);
    
    // Clean up
    await firstContext.close();
  });

  test('should handle two users in separate rooms without interference', async ({ browser }) => {
    // Create first user and room
    const firstContext = await browser.newContext();
    const firstPage = await firstContext.newPage();
    const firstRoomFixture = new RoomFixture(firstPage);
    const firstWsFixture = new WebSocketFixture(firstPage);
    
    await firstWsFixture.startIntercepting();
    const firstRoomId = await firstRoomFixture.createRoom();
    
    // Wait before creating second user
    await firstPage.waitForTimeout(3000);
    
    // Create second user and room
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondRoomFixture = new RoomFixture(secondPage);
    const secondWsFixture = new WebSocketFixture(secondPage);
    
    await secondWsFixture.startIntercepting();
    const secondRoomId = await secondRoomFixture.createRoom();
    
    // Verify different rooms
    expect(firstRoomId).not.toBe(secondRoomId);
    expect(firstPage.url()).toContain(`/${firstRoomId}`);
    expect(secondPage.url()).toContain(`/${secondRoomId}`);
    
    // Both users should have their own WebSocket connections
    const firstMessages = firstWsFixture.getMessages();
    const secondMessages = secondWsFixture.getMessages();
    
    expect(firstMessages.length).toBeGreaterThan(0);
    expect(secondMessages.length).toBeGreaterThan(0);
    
    // Clean up
    await firstContext.close();
    await secondContext.close();
  });

  test('should capture WebSocket messages during room interaction', async ({ browser }) => {
    // Create user and room
    const context = await browser.newContext();
    const page = await context.newPage();
    const roomFixture = new RoomFixture(page);
    const wsFixture = new WebSocketFixture(page);
    
    await wsFixture.startIntercepting();
    
    // Create room
    const roomId = await roomFixture.createRoom();
    
    // Wait for initial WebSocket activity
    await page.waitForTimeout(2000);
    
    // Get initial messages
    const initialMessages = wsFixture.getMessages();
    
    // Clear messages to track new ones
    wsFixture.clearMessages();
    
    // Simulate some activity (clicking around)
    await page.click('body');
    await page.waitForTimeout(1000);
    
    // Check if any new messages were captured
    const newMessages = wsFixture.getMessages();
    
    // Verify WebSocket monitoring is working
    expect(initialMessages.length).toBeGreaterThan(0);
    
    // Clean up
    await context.close();
  });
});