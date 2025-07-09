import { test, expect } from '@playwright/test';
import { RoomFixture } from '../../fixtures/room-fixture';
import { WebSocketFixture } from '../../fixtures/websocket-fixture';
import { WebRTCFixture } from '../../fixtures/webrtc-fixture';
import { PianoFixture } from '../../fixtures/piano-fixture';

test.describe('WebRTC Full Duplex Communication', () => {
  test('should establish WebRTC connections for both users in same room', async ({ page, context, browser }) => {
    // Create first user
    const firstRoomFixture = new RoomFixture(page);
    const firstWsFixture = new WebSocketFixture(page);
    const firstWebrtcFixture = new WebRTCFixture(page);
    const firstPianoFixture = new PianoFixture(page);
    
    await firstWsFixture.startIntercepting();
    await firstWebrtcFixture.startIntercepting();
    
    // Create room and join with first user
    const roomId = await firstRoomFixture.createRoom();
    await firstRoomFixture.joinRoom(roomId, 'User One');
    await firstPianoFixture.waitForPianoReady();
    
    // Create second user with separate browser context
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondRoomFixture = new RoomFixture(secondPage);
    const secondWsFixture = new WebSocketFixture(secondPage);
    const secondWebrtcFixture = new WebRTCFixture(secondPage);
    const secondPianoFixture = new PianoFixture(secondPage);
    
    await secondWsFixture.startIntercepting();
    await secondWebrtcFixture.startIntercepting();
    
    // Second user joins the same room
    await secondRoomFixture.joinRoom(roomId, 'User Two');
    await secondPianoFixture.waitForPianoReady();
    
    // Wait for WebRTC connections to be established
    await firstWebrtcFixture.waitForConnection(15000);
    await secondWebrtcFixture.waitForConnection(15000);
    
    // Verify both users have WebRTC connections
    expect(await firstWebrtcFixture.isWebRTCConnected()).toBe(true);
    expect(await secondWebrtcFixture.isWebRTCConnected()).toBe(true);
    
    // Verify connection states
    const firstConnectionStates = await firstWebrtcFixture.getConnectionStates();
    const secondConnectionStates = await secondWebrtcFixture.getConnectionStates();
    
    expect(Object.keys(firstConnectionStates).length).toBeGreaterThan(0);
    expect(Object.keys(secondConnectionStates).length).toBeGreaterThan(0);
    
    // Verify at least one connection is in 'connected' state for each user
    expect(Object.values(firstConnectionStates)).toContain('connected');
    expect(Object.values(secondConnectionStates)).toContain('connected');
    
    // Clean up
    await secondPage.close();
    await secondContext.close();
  });

  test('should send messages over WebRTC from both users bidirectionally', async ({ page, context, browser }) => {
    // Setup two users
    const firstRoomFixture = new RoomFixture(page);
    const firstWebrtcFixture = new WebRTCFixture(page);
    const firstPianoFixture = new PianoFixture(page);
    
    await firstWebrtcFixture.startIntercepting();
    
    const roomId = await firstRoomFixture.createRoom();
    await firstRoomFixture.joinRoom(roomId, 'User One');
    await firstPianoFixture.waitForPianoReady();
    
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondRoomFixture = new RoomFixture(secondPage);
    const secondWebrtcFixture = new WebRTCFixture(secondPage);
    const secondPianoFixture = new PianoFixture(secondPage);
    
    await secondWebrtcFixture.startIntercepting();
    await secondRoomFixture.joinRoom(roomId, 'User Two');
    await secondPianoFixture.waitForPianoReady();
    
    // Wait for WebRTC connections
    await firstWebrtcFixture.waitForConnection(15000);
    await secondWebrtcFixture.waitForConnection(15000);
    
    // Clear any existing messages
    await firstWebrtcFixture.clearMessages();
    await secondWebrtcFixture.clearMessages();
    
    // User One plays a note
    await firstPianoFixture.playKey('C4');
    
    // Verify User One sent the message over WebRTC
    const userOneKeyDown = await firstWebrtcFixture.waitForMessage('KEY_DOWN', 5000);
    expect(userOneKeyDown.payload.note).toBe(60); // C4 = MIDI note 60
    
    // Wait a moment for message propagation
    await page.waitForTimeout(1000);
    
    // User Two plays a different note
    await secondPianoFixture.playKey('E4');
    
    // Verify User Two sent the message over WebRTC
    const userTwoKeyDown = await secondWebrtcFixture.waitForMessage('KEY_DOWN', 5000);
    expect(userTwoKeyDown.payload.note).toBe(64); // E4 = MIDI note 64
    
    // Verify bidirectional communication - both users should have received each other's messages
    const userOneMessages = await firstWebrtcFixture.getMessages();
    const userTwoMessages = await secondWebrtcFixture.getMessages();
    
    // User One should have sent their own message and potentially received User Two's
    expect(userOneMessages.filter(msg => msg.type === 'sent' && msg.message.action === 'KEY_DOWN')).toHaveLength(1);
    
    // User Two should have sent their own message and potentially received User One's
    expect(userTwoMessages.filter(msg => msg.type === 'sent' && msg.message.action === 'KEY_DOWN')).toHaveLength(1);
    
    // Clean up
    await secondPage.close();
    await secondContext.close();
  });

  test('should NOT fallback to WebSocket when WebRTC is available', async ({ page, context, browser }) => {
    // Setup two users
    const firstRoomFixture = new RoomFixture(page);
    const firstWsFixture = new WebSocketFixture(page);
    const firstWebrtcFixture = new WebRTCFixture(page);
    const firstPianoFixture = new PianoFixture(page);
    
    await firstWsFixture.startIntercepting();
    await firstWebrtcFixture.startIntercepting();
    
    const roomId = await firstRoomFixture.createRoom();
    await firstRoomFixture.joinRoom(roomId, 'User One');
    await firstPianoFixture.waitForPianoReady();
    
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondRoomFixture = new RoomFixture(secondPage);
    const secondWsFixture = new WebSocketFixture(secondPage);
    const secondWebrtcFixture = new WebRTCFixture(secondPage);
    const secondPianoFixture = new PianoFixture(secondPage);
    
    await secondWsFixture.startIntercepting();
    await secondWebrtcFixture.startIntercepting();
    await secondRoomFixture.joinRoom(roomId, 'User Two');
    await secondPianoFixture.waitForPianoReady();
    
    // Wait for WebRTC connections to be established
    await firstWebrtcFixture.waitForConnection(15000);
    await secondWebrtcFixture.waitForConnection(15000);
    
    // Clear messages to focus on user actions
    await firstWsFixture.clearMessages();
    await secondWsFixture.clearMessages();
    await firstWebrtcFixture.clearMessages();
    await secondWebrtcFixture.clearMessages();
    
    // User One plays a note
    await firstPianoFixture.playKey('C4');
    
    // Wait for message to be sent
    await page.waitForTimeout(1000);
    
    // Verify the message was sent over WebRTC, NOT WebSocket
    const webrtcMessages = await firstWebrtcFixture.getMessages();
    const websocketMessages = await firstWsFixture.getMessages();
    
    // Should have WebRTC KEY_DOWN message
    const webrtcKeyDowns = webrtcMessages.filter(msg => msg.type === 'sent' && msg.message.action === 'KEY_DOWN');
    expect(webrtcKeyDowns).toHaveLength(1);
    
    // Should NOT have WebSocket KEY_DOWN message (no fallback)
    const websocketKeyDowns = websocketMessages.filter(msg => msg.type === 'sent' && msg.message.action === 'KEY_DOWN');
    expect(websocketKeyDowns).toHaveLength(0);
    
    // Clean up
    await secondPage.close();
    await secondContext.close();
  });

  test('should handle WebRTC connection failures gracefully', async ({ page, context, browser }) => {
    // This test will help catch when WebRTC fails to establish
    const firstRoomFixture = new RoomFixture(page);
    const firstWebrtcFixture = new WebRTCFixture(page);
    const firstPianoFixture = new PianoFixture(page);
    
    await firstWebrtcFixture.startIntercepting();
    
    const roomId = await firstRoomFixture.createRoom();
    await firstRoomFixture.joinRoom(roomId, 'User One');
    await firstPianoFixture.waitForPianoReady();
    
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondRoomFixture = new RoomFixture(secondPage);
    const secondWebrtcFixture = new WebRTCFixture(secondPage);
    const secondPianoFixture = new PianoFixture(secondPage);
    
    await secondWebrtcFixture.startIntercepting();
    await secondRoomFixture.joinRoom(roomId, 'User Two');
    await secondPianoFixture.waitForPianoReady();
    
    // Wait for WebRTC connections - this should succeed in normal circumstances
    try {
      await firstWebrtcFixture.waitForConnection(15000);
      await secondWebrtcFixture.waitForConnection(15000);
      
      // If we get here, WebRTC connections were established successfully
      expect(await firstWebrtcFixture.isWebRTCConnected()).toBe(true);
      expect(await secondWebrtcFixture.isWebRTCConnected()).toBe(true);
      
    } catch (error) {
      // If WebRTC fails to establish, this test should fail to catch regressions
      console.error('WebRTC connection failed:', error);
      throw new Error(`WebRTC full duplex regression detected: ${error.message}`);
    }
    
    // Clean up
    await secondPage.close();
    await secondContext.close();
  });

  test('should maintain WebRTC connections during active gameplay', async ({ page, context, browser }) => {
    // Setup two users
    const firstRoomFixture = new RoomFixture(page);
    const firstWebrtcFixture = new WebRTCFixture(page);
    const firstPianoFixture = new PianoFixture(page);
    
    await firstWebrtcFixture.startIntercepting();
    
    const roomId = await firstRoomFixture.createRoom();
    await firstRoomFixture.joinRoom(roomId, 'User One');
    await firstPianoFixture.waitForPianoReady();
    
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondRoomFixture = new RoomFixture(secondPage);
    const secondWebrtcFixture = new WebRTCFixture(secondPage);
    const secondPianoFixture = new PianoFixture(secondPage);
    
    await secondWebrtcFixture.startIntercepting();
    await secondRoomFixture.joinRoom(roomId, 'User Two');
    await secondPianoFixture.waitForPianoReady();
    
    // Wait for WebRTC connections
    await firstWebrtcFixture.waitForConnection(15000);
    await secondWebrtcFixture.waitForConnection(15000);
    
    // Play multiple notes back and forth to test sustained connection
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4'];
    
    for (let i = 0; i < notes.length; i++) {
      // Alternate between users
      if (i % 2 === 0) {
        await firstPianoFixture.playKey(notes[i]);
        await firstWebrtcFixture.waitForMessage('KEY_DOWN', 5000);
      } else {
        await secondPianoFixture.playKey(notes[i]);
        await secondWebrtcFixture.waitForMessage('KEY_DOWN', 5000);
      }
      
      // Verify connections are still active
      expect(await firstWebrtcFixture.isWebRTCConnected()).toBe(true);
      expect(await secondWebrtcFixture.isWebRTCConnected()).toBe(true);
      
      // Small delay between notes
      await page.waitForTimeout(200);
    }
    
    // Clean up
    await secondPage.close();
    await secondContext.close();
  });
});