import { type Page, type BrowserContext } from '@playwright/test';

/**
 * Test helper utilities for P2Piano integration tests
 * 
 * Provides common functionality for managing test scenarios,
 * timing, and multi-user interactions.
 */

/**
 * Generate a random display name for testing
 */
export function generateRandomDisplayName(): string {
  const adjectives = ['Happy', 'Jazzy', 'Smooth', 'Rhythmic', 'Melodic', 'Harmonic'];
  const nouns = ['Pianist', 'Musician', 'Player', 'Artist', 'Composer', 'Performer'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  
  return `${adjective}${noun}${number}`;
}

/**
 * Create multiple user sessions for testing
 */
export async function createMultipleUsers(
  context: BrowserContext,
  count: number,
  roomId: string,
  namePrefix: string = 'User'
): Promise<Array<{ page: Page; name: string }>> {
  const users: Array<{ page: Page; name: string }> = [];
  
  for (let i = 0; i < count; i++) {
    const page = await context.newPage();
    const name = `${namePrefix} ${i + 1}`;
    
    users.push({ page, name });
  }
  
  return users;
}

/**
 * Wait for all users to be connected to a room
 */
export async function waitForAllUsersConnected(
  users: Array<{ page: Page; name: string }>,
  timeout: number = 15000
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    let allConnected = true;
    
    for (const user of users) {
      const isConnected = await user.page.evaluate(() => {
        return document.querySelector('[data-testid="connection-status"]')?.textContent?.includes('Connected') ||
               document.querySelector('.connection-indicator')?.classList?.contains('connected') ||
               document.querySelector('[data-testid="room-sidebar"], .room-sidebar')?.children?.length > 0;
      });
      
      if (!isConnected) {
        allConnected = false;
        break;
      }
    }
    
    if (allConnected) {
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error(`Not all users connected within ${timeout}ms`);
}

/**
 * Clean up multiple user sessions
 */
export async function cleanupUsers(users: Array<{ page: Page; name: string }>): Promise<void> {
  for (const user of users) {
    await user.page.close();
  }
}

/**
 * Wait for a specific condition with polling
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Simulate typing with realistic delays
 */
export async function typeWithDelay(
  page: Page,
  selector: string,
  text: string,
  delay: number = 50
): Promise<void> {
  await page.focus(selector);
  
  for (const char of text) {
    await page.keyboard.type(char);
    await page.waitForTimeout(delay);
  }
}

/**
 * Get random notes for testing
 */
export function getRandomNotes(count: number): string[] {
  const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  const selectedNotes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    selectedNotes.push(randomNote);
  }
  
  return selectedNotes;
}

/**
 * Generate a test melody sequence
 */
export function generateTestMelody(): Array<{ note: string; duration: number }> {
  return [
    { note: 'C4', duration: 500 },
    { note: 'D4', duration: 500 },
    { note: 'E4', duration: 500 },
    { note: 'F4', duration: 500 },
    { note: 'G4', duration: 1000 },
    { note: 'G4', duration: 1000 },
    { note: 'A4', duration: 500 },
    { note: 'A4', duration: 500 },
    { note: 'A4', duration: 500 },
    { note: 'A4', duration: 500 },
    { note: 'G4', duration: 2000 }
  ];
}

/**
 * Generate a test chord progression
 */
export function generateTestChords(): Array<{ notes: string[]; duration: number }> {
  return [
    { notes: ['C4', 'E4', 'G4'], duration: 2000 },    // C major
    { notes: ['F4', 'A4', 'C5'], duration: 2000 },    // F major
    { notes: ['G4', 'B4', 'D5'], duration: 2000 },    // G major
    { notes: ['C4', 'E4', 'G4'], duration: 2000 }     // C major
  ];
}

/**
 * Measure network timing between actions
 */
export class NetworkTiming {
  private startTime: number = 0;
  
  start(): void {
    this.startTime = Date.now();
  }
  
  end(): number {
    return Date.now() - this.startTime;
  }
  
  static async measureAction<T>(action: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await action();
    const duration = Date.now() - startTime;
    
    return { result, duration };
  }
}

/**
 * Assert that timing is within acceptable limits
 */
export function assertReasonableLatency(duration: number, maxLatency: number = 1000): void {
  if (duration > maxLatency) {
    throw new Error(`Action took ${duration}ms, which exceeds the acceptable latency of ${maxLatency}ms`);
  }
}

/**
 * Create a test room with specified configuration
 */
export interface TestRoomConfig {
  userCount: number;
  userNamePrefix?: string;
  roomId?: string;
  instruments?: string[];
}

export async function createTestRoom(
  context: BrowserContext,
  config: TestRoomConfig
): Promise<{
  roomId: string;
  users: Array<{ page: Page; name: string; instrument?: string }>;
}> {
  // Create first user to establish the room
  const firstPage = await context.newPage();
  const firstUser = { page: firstPage, name: `${config.userNamePrefix || 'User'} 1` };
  
  // Create room or join existing one
  let roomId = config.roomId;
  if (!roomId) {
    // Logic to create room would go here
    roomId = 'TEST1'; // Placeholder
  }
  
  // Create additional users
  const users = [firstUser];
  for (let i = 1; i < config.userCount; i++) {
    const page = await context.newPage();
    const name = `${config.userNamePrefix || 'User'} ${i + 1}`;
    users.push({ page, name });
  }
  
  return { roomId, users };
}

/**
 * Wait for all WebSocket connections to be established
 */
export async function waitForAllWebSocketConnections(
  users: Array<{ page: Page; name: string }>,
  timeout: number = 10000
): Promise<void> {
  const promises = users.map(user => 
    user.page.waitForFunction(() => {
      return (window as any).io && (window as any).io.connected;
    }, { timeout })
  );
  
  await Promise.all(promises);
}