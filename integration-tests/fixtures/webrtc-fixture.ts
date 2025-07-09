import { type Page } from '@playwright/test';

/**
 * WebRTC fixture for testing peer-to-peer communication in P2Piano
 * 
 * Provides utilities for intercepting WebRTC data channel messages
 * and testing real-time collaborative features.
 */
export class WebRTCFixture {
  private dataChannelMessages: Array<{
    type: 'sent' | 'received';
    timestamp: number;
    message: any;
  }> = [];

  private consoleLogs: string[] = [];

  constructor(private page: Page) {
    // Capture console logs for debugging
    this.page.on('console', (msg) => {
      if (msg.text().includes('[WebRTC]') || msg.text().includes('[WebSocket]')) {
        this.consoleLogs.push(`${new Date().toISOString()}: ${msg.text()}`);
      }
    });
  }

  /**
   * Start intercepting WebRTC data channel messages
   */
  async startIntercepting(): Promise<void> {
    this.dataChannelMessages = [];
    
    // Inject script to intercept WebRTC data channel messages
    // This needs to be done before any WebRTC connections are established
    await this.page.addInitScript(() => {
      // Initialize the messages array and connection tracking
      (window as any).webrtcMessages = [];
      (window as any).webrtcConnectionStates = {};
      (window as any).webrtcConnected = false;
      (window as any).webrtcPeerConnections = new Map();
      
      // Override RTCPeerConnection to capture data channels and connection states
      const originalRTCPeerConnection = (window as any).RTCPeerConnection;
      
      (window as any).RTCPeerConnection = class extends originalRTCPeerConnection {
        constructor(...args: any[]) {
          super(...args);
          
          // Generate unique ID for this connection
          const connectionId = 'peer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          (window as any).webrtcPeerConnections.set(connectionId, this);
          
          // Track connection state changes
          this.addEventListener('connectionstatechange', () => {
            (window as any).webrtcConnectionStates[connectionId] = this.connectionState;
            
            // Update global connected state
            const states = Object.values((window as any).webrtcConnectionStates);
            (window as any).webrtcConnected = states.some((state: any) => state === 'connected');
            
            console.log(`WebRTC connection ${connectionId} state: ${this.connectionState}`);
          });
          
          // Listen for data channel events
          this.addEventListener('datachannel', (event: any) => {
            const channel = event.channel;
            
            // Set up message handler for received messages
            channel.onmessage = (messageEvent: any) => {
              try {
                const data = JSON.parse(messageEvent.data);
                (window as any).webrtcMessages = (window as any).webrtcMessages || [];
                (window as any).webrtcMessages.push({
                  type: 'received',
                  timestamp: Date.now(),
                  message: data,
                  connectionId
                });
              } catch (e) {
                // Handle non-JSON messages
                (window as any).webrtcMessages = (window as any).webrtcMessages || [];
                (window as any).webrtcMessages.push({
                  type: 'received',
                  timestamp: Date.now(),
                  message: messageEvent.data,
                  connectionId
                });
              }
            };
          });
        }
        
        createDataChannel(...args: any[]) {
          const channel = super.createDataChannel(...args);
          
          // Find the connection ID for this instance
          let connectionId = 'unknown';
          for (const [id, conn] of (window as any).webrtcPeerConnections) {
            if (conn === this) {
              connectionId = id;
              break;
            }
          }
          
          // Intercept sent messages
          const originalSend = channel.send;
          channel.send = function(data: any) {
            try {
              const parsedData = JSON.parse(data);
              (window as any).webrtcMessages = (window as any).webrtcMessages || [];
              (window as any).webrtcMessages.push({
                type: 'sent',
                timestamp: Date.now(),
                message: parsedData,
                connectionId
              });
            } catch (e) {
              // Handle non-JSON messages
              (window as any).webrtcMessages = (window as any).webrtcMessages || [];
              (window as any).webrtcMessages.push({
                type: 'sent',
                timestamp: Date.now(),
                message: data,
                connectionId
              });
            }
            return originalSend.call(this, data);
          };
          
          return channel;
        }
      };
    });
  }

  /**
   * Wait for a specific WebRTC data channel message
   */
  async waitForMessage(eventType: string, timeout: number = 10000): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      // Get messages from the page
      const messages = await this.page.evaluate(() => {
        return (window as any).webrtcMessages || [];
      });
      
      // Check both sent and received messages for the event type
      const message = messages.find((msg: any) => 
        msg.message.action === eventType
      );
      
      if (message) {
        return message.message;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`WebRTC message '${eventType}' not received within ${timeout}ms`);
  }

  /**
   * Wait for WebRTC connection to be established
   */
  async waitForConnection(timeout: number = 10000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const connected = await this.page.evaluate(() => {
        // Check if there are any RTCPeerConnection instances with connected state
        return (window as any).webrtcConnected || false;
      });
      
      if (connected) {
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`WebRTC connection not established within ${timeout}ms`);
  }

  /**
   * Check if WebRTC connection is active
   */
  async isWebRTCConnected(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return (window as any).webrtcConnected || false;
    });
  }

  /**
   * Get WebRTC connection states for all peers
   */
  async getConnectionStates(): Promise<Record<string, string>> {
    return await this.page.evaluate(() => {
      return (window as any).webrtcConnectionStates || {};
    });
  }

  /**
   * Wait for specific number of WebRTC connections to be established
   */
  async waitForConnections(expectedCount: number, timeout: number = 10000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const states = await this.getConnectionStates();
      const connectedCount = Object.values(states).filter(state => state === 'connected').length;
      
      if (connectedCount >= expectedCount) {
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Expected ${expectedCount} WebRTC connections but only found ${Object.keys(await this.getConnectionStates()).length} within ${timeout}ms`);
  }

  /**
   * Get all WebRTC messages
   */
  async getMessages(): Promise<any[]> {
    return await this.page.evaluate(() => {
      return (window as any).webrtcMessages || [];
    });
  }

  /**
   * Clear all captured messages
   */
  async clearMessages(): Promise<void> {
    await this.page.evaluate(() => {
      (window as any).webrtcMessages = [];
    });
  }

  /**
   * Get captured console logs
   */
  getConsoleLogs(): string[] {
    return [...this.consoleLogs];
  }

  /**
   * Clear captured console logs
   */
  clearConsoleLogs(): void {
    this.consoleLogs = [];
  }
}