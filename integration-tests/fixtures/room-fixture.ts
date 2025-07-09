import { type Page } from '@playwright/test';

/**
 * Room fixture for managing P2Piano room operations in tests
 * 
 * Provides utilities for creating, joining, and managing rooms
 * with proper WebSocket connection handling and state management.
 */
export class RoomFixture {
  constructor(private page: Page) {}

  /**
   * Create a new room and return the room ID
   */
  async createRoom(): Promise<string> {
    await this.page.goto('/');
    
    // Clear localStorage to ensure fresh state
    await this.page.evaluate(() => localStorage.clear());
    
    // Dismiss Vite error overlay if present
    try {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
    } catch (e) {
      // Ignore if no overlay to dismiss
    }
    
    // Wait for the application to load
    await this.page.waitForSelector('button:has-text("create room")', { timeout: 10000 });
    
    // Add delay to avoid throttling
    await this.page.waitForTimeout(1000);
    
    // Force click to bypass any overlays
    await this.page.locator('button:has-text("create room")').click({ force: true });
    
    // Wait for room creation and redirect (room codes are lowercase)
    // Generous timeout for all browsers
    await this.page.waitForURL(/\/[a-z0-9]{5}$/, { timeout: 30000 });
    
    // Extract room ID from URL
    const url = this.page.url();
    const roomId = url.split('/').pop();
    
    if (!roomId || roomId.length !== 5) {
      throw new Error(`Invalid room ID extracted: ${roomId}`);
    }
    
    return roomId;
  }

  /**
   * Create a new room and enter it with a display name
   */
  async createAndEnterRoom(displayName: string): Promise<string> {
    const roomId = await this.createRoom();
    
    // Handle Vite error overlay
    await this.dismissViteErrorOverlay();
    
    // Check if settings modal is visible
    const modalVisible = await this.page.locator('[class*="modalOverlay"]').isVisible().catch(() => false);
    
    if (modalVisible) {
      // Wait for the display name input to be visible - it's inside a fieldset with a label
      await this.page.waitForSelector('[class*="fieldset"] input[class*="input"]:not([readonly])', { timeout: 5000 });
      
      // Fill in display name and enter the room - target the non-readonly input (display name)
      await this.page.fill('[class*="fieldset"] input[class*="input"]:not([readonly])', displayName);
      await this.page.locator('button:has-text("let\'s go")').click();
    }
    
    // Wait for room to be ready
    await this.waitForRoomReady();
    
    return roomId;
  }

  /**
   * Join an existing room with a display name
   */
  async joinRoom(roomId: string, displayName: string): Promise<void> {
    await this.page.goto(`/${roomId}`);
    
    // Handle Vite error overlay
    await this.dismissViteErrorOverlay();
    
    // Wait for settings modal to appear
    await this.page.waitForSelector('[class*="modalOverlay"]', { timeout: 10000 });
    
    // Wait for the display name input to be visible - it's inside a fieldset with a label
    await this.page.waitForSelector('[class*="fieldset"] input[class*="input"]:not([readonly])', { timeout: 5000 });
    
    // Fill display name - target the non-readonly input (display name)
    await this.page.fill('[class*="fieldset"] input[class*="input"]:not([readonly])', displayName);
    
    // Click join button
    await this.page.locator('button:has-text("let\'s go")').click();
    
    // Wait for room to load
    await this.waitForRoomReady();
  }

  /**
   * Wait for the room to be fully loaded and WebSocket connected
   */
  async waitForRoomReady(): Promise<void> {
    // Dismiss any error overlays first
    await this.dismissViteErrorOverlay();
    
    // Use a more robust approach with multiple fallbacks for all browsers
    try {
      // First, wait for the basic page structure
      await this.page.waitForSelector('body', { timeout: 10000 });
      
      // Wait for room content with multiple strategies
      await this.page.waitForFunction(() => {
        // Check for room content with comprehensive selectors
        const roomContent = document.querySelector('[class*="roomSidebar"]') || 
                           document.querySelector('[class*="pianoRendererContainer"]') ||
                           document.querySelector('[class*="room"]') || 
                           document.querySelector('[class*="piano"]') ||
                           document.querySelector('[class*="sidebar"]') ||
                           document.querySelector('button') ||
                           document.querySelector('select');
        
        // Check that we're not in a loading state
        const noLoadingSpinner = !document.querySelector('[class*="loadingContainer"]') &&
                                !document.querySelector('[class*="spinner"]') &&
                                !document.querySelector('[class*="loading"]');
        
        return roomContent && noLoadingSpinner;
      }, { timeout: 25000 }); // Increased timeout for all browsers
      
      // Additional wait for stability
      await this.page.waitForTimeout(2000);
      
    } catch (error) {
      // Fallback: wait for any interactive element that indicates room is ready
      try {
        await this.page.waitForSelector('button, select, input', { timeout: 15000 });
        await this.page.waitForTimeout(1000);
      } catch (fallbackError) {
        // Final fallback: just wait for navigation to complete
        await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      }
    }
  }

  /**
   * Get the current room ID from the URL
   */
  getCurrentRoomId(): string {
    const url = this.page.url();
    const roomId = url.split('/').pop();
    
    if (!roomId || roomId.length !== 5) {
      throw new Error(`Invalid room ID in URL: ${roomId}`);
    }
    
    return roomId;
  }

  /**
   * Get the list of users currently in the room
   */
  async getUserList(): Promise<string[]> {
    await this.page.waitForSelector('[class*="usersList"]', { timeout: 5000 });
    
    // Extract user names from the sidebar - look for list items in the users list
    const userElements = await this.page.locator('[class*="userItem"] span:not([class*="userColorIndicator"])').all();
    const userNames: string[] = [];
    
    for (const element of userElements) {
      const name = await element.textContent();
      if (name?.trim() && name.trim() !== '⚠️') { // Exclude warning icons
        userNames.push(name.trim());
      }
    }
    
    return userNames;
  }

  /**
   * Wait for a specific user to appear in the room
   */
  async waitForUserToJoin(displayName: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForFunction(
      (name) => {
        // Find all user items and check their text content
        const userItems = document.querySelectorAll('[class*="userItem"]');
        return Array.from(userItems).some(item => {
          // Get text from spans that are not color indicators or warning icons
          const textSpans = item.querySelectorAll('span:not([class*="userColorIndicator"])');
          return Array.from(textSpans).some(span => 
            span.textContent?.trim() === name && span.textContent?.trim() !== '⚠️'
          );
        });
      },
      displayName,
      { timeout }
    );
  }

  /**
   * Wait for a specific user to leave the room
   */
  async waitForUserToLeave(displayName: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForFunction(
      (name) => {
        // Find all user items and check their text content
        const userItems = document.querySelectorAll('[class*="userItem"]');
        return !Array.from(userItems).some(item => {
          // Get text from spans that are not color indicators or warning icons
          const textSpans = item.querySelectorAll('span:not([class*="userColorIndicator"])');
          return Array.from(textSpans).some(span => 
            span.textContent?.trim() === name && span.textContent?.trim() !== '⚠️'
          );
        });
      },
      displayName,
      { timeout }
    );
  }

  /**
   * Leave the current room
   */
  async leaveRoom(): Promise<void> {
    // Navigate away from the room (this will trigger disconnect)
    await this.page.goto('/');
    
    // Wait for navigation to complete
    await this.page.waitForURL('/', { timeout: 5000 });
  }

  /**
   * Dismiss Vite error overlay that may interfere with tests
   */
  private async dismissViteErrorOverlay(): Promise<void> {
    try {
      // Wait a bit for any overlay to appear
      await this.page.waitForTimeout(500);
      
      // Check if Vite error overlay is present
      const errorOverlay = await this.page.locator('vite-error-overlay').isVisible().catch(() => false);
      
      if (errorOverlay) {
        // Try to close it with ESC key
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(500);
        
        // Try clicking the close button if it exists
        const closeButton = this.page.locator('vite-error-overlay .close');
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
      
      // Also handle any generic error overlays
      const genericOverlay = await this.page.locator('[class*="error"][class*="overlay"]').isVisible().catch(() => false);
      if (genericOverlay) {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(500);
      }
    } catch (e) {
      // Ignore errors in dismissing overlay
    }
  }
}