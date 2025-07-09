import { type Page } from '@playwright/test';

/**
 * WebSocket fixture for testing real-time communication in P2Piano
 * 
 * Provides utilities for intercepting, monitoring, and asserting on
 * WebSocket messages during collaborative sessions.
 */
export class WebSocketFixture {
  private webSocketMessages: any[] = [];
  private webSocket: any = null;

  constructor(private page: Page) {}

  /**
   * Start intercepting WebSocket messages
   */
  async startIntercepting(): Promise<void> {
    this.webSocketMessages = [];
    
    // Listen for WebSocket connections
    this.page.on('websocket', (ws) => {
      this.webSocket = ws;
      
      // Listen for messages
      ws.on('framereceived', (event) => {
        try {
          const message = JSON.parse(event.payload.toString());
          this.webSocketMessages.push({
            type: 'received',
            timestamp: Date.now(),
            message: message
          });
        } catch (e) {
          // Handle non-JSON messages
          this.webSocketMessages.push({
            type: 'received',
            timestamp: Date.now(),
            message: event.payload.toString()
          });
        }
      });
      
      ws.on('framesent', (event) => {
        try {
          const message = JSON.parse(event.payload.toString());
          this.webSocketMessages.push({
            type: 'sent',
            timestamp: Date.now(),
            message: message
          });
        } catch (e) {
          // Handle non-JSON messages
          this.webSocketMessages.push({
            type: 'sent',
            timestamp: Date.now(),
            message: event.payload.toString()
          });
        }
      });
    });
  }

  /**
   * Wait for a specific WebSocket message
   */
  async waitForMessage(eventType: string, timeout: number = 5000): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const message = this.webSocketMessages.find(msg => 
        msg.type === 'received' && 
        (msg.message[0] === eventType || msg.message.type === eventType)
      );
      
      if (message) {
        return message.message;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`WebSocket message '${eventType}' not received within ${timeout}ms`);
  }

  /**
   * Wait for a user connect message
   */
  async waitForUserConnect(timeout: number = 5000): Promise<any> {
    return this.waitForMessage('USER_CONNECT', timeout);
  }

  /**
   * Wait for a user disconnect message
   */
  async waitForUserDisconnect(timeout: number = 5000): Promise<any> {
    return this.waitForMessage('USER_DISCONNECT', timeout);
  }

  /**
   * Wait for a room join message
   */
  async waitForRoomJoin(timeout: number = 5000): Promise<any> {
    return this.waitForMessage('ROOM_JOIN', timeout);
  }

  /**
   * Wait for a note on message
   */
  async waitForNoteOn(timeout: number = 5000): Promise<any> {
    return this.waitForMessage('NOTE_ON', timeout);
  }

  /**
   * Wait for a note off message
   */
  async waitForNoteOff(timeout: number = 5000): Promise<any> {
    return this.waitForMessage('NOTE_OFF', timeout);
  }

  /**
   * Get all WebSocket messages
   */
  getMessages(): any[] {
    return [...this.webSocketMessages];
  }

  /**
   * Get messages of a specific type
   */
  getMessagesByType(type: 'sent' | 'received'): any[] {
    return this.webSocketMessages.filter(msg => msg.type === type);
  }

  /**
   * Get messages by event type
   */
  getMessagesByEvent(eventType: string): any[] {
    return this.webSocketMessages.filter(msg => 
      msg.message[0] === eventType || msg.message.type === eventType
    );
  }

  /**
   * Clear all intercepted messages
   */
  clearMessages(): void {
    this.webSocketMessages = [];
  }

  /**
   * Simulate network disconnection
   */
  async simulateDisconnection(): Promise<void> {
    await this.page.context().setOffline(true);
  }

  /**
   * Simulate network reconnection
   */
  async simulateReconnection(): Promise<void> {
    await this.page.context().setOffline(false);
  }

  /**
   * Wait for WebSocket to be connected
   */
  async waitForConnection(timeout: number = 10000): Promise<void> {
    await this.page.waitForFunction(() => {
      // Check if WebSocket is connected by looking for Socket.IO connection
      return (window as any).io && (window as any).io.connected;
    }, { timeout });
  }

  /**
   * Check if WebSocket is currently connected
   */
  async isConnected(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return (window as any).io && (window as any).io.connected;
    });
  }

  /**
   * Get the current WebSocket ready state
   */
  async getReadyState(): Promise<number> {
    return await this.page.evaluate(() => {
      const socket = (window as any).io?.socket;
      return socket ? socket.readyState : -1;
    });
  }
}