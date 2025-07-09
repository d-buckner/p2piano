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

  constructor(private page: Page) {}

  /**
   * Start intercepting WebRTC data channel messages
   */
  async startIntercepting(): Promise<void> {
    this.dataChannelMessages = [];
    
    // Inject script to intercept WebRTC data channel messages
    // This needs to be done before any WebRTC connections are established
    await this.page.addInitScript(() => {
      // Initialize the messages array
      (window as any).webrtcMessages = [];
      
      // Override RTCPeerConnection to capture data channels
      const originalRTCPeerConnection = (window as any).RTCPeerConnection;
      
      (window as any).RTCPeerConnection = class extends originalRTCPeerConnection {
        constructor(...args: any[]) {
          super(...args);
          
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
                  message: data
                });
              } catch (e) {
                // Handle non-JSON messages
                (window as any).webrtcMessages = (window as any).webrtcMessages || [];
                (window as any).webrtcMessages.push({
                  type: 'received',
                  timestamp: Date.now(),
                  message: messageEvent.data
                });
              }
            };
          });
        }
        
        createDataChannel(...args: any[]) {
          const channel = super.createDataChannel(...args);
          
          // Intercept sent messages
          const originalSend = channel.send;
          channel.send = function(data: any) {
            try {
              const parsedData = JSON.parse(data);
              (window as any).webrtcMessages = (window as any).webrtcMessages || [];
              (window as any).webrtcMessages.push({
                type: 'sent',
                timestamp: Date.now(),
                message: parsedData
              });
            } catch (e) {
              // Handle non-JSON messages
              (window as any).webrtcMessages = (window as any).webrtcMessages || [];
              (window as any).webrtcMessages.push({
                type: 'sent',
                timestamp: Date.now(),
                message: data
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
}