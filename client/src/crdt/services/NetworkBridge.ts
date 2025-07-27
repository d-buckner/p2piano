import Logger from '../../lib/Logger';
import { MessageTypeGuards } from '../types/MessageTypes';
import type { MessageHandler } from '../../networking/AbstractNetworkController';
import type RealTimeController from '../../networking/RealTimeController';
import type { AutomergeSyncMessage } from '../types/MessageTypes';

/**
 * Handles message passing between CRDT system and RealTimeController.
 * Manages peer connection events and sync message routing.
 */
export class NetworkBridge {
  private rtc: RealTimeController;
  private actorId: string;
  private onSyncMessage?: (peerId: string, message: Uint8Array) => void;
  private onPeerConnect?: (peerId: string) => void;
  private onPeerDisconnect?: (peerId: string) => void;
  
  // Store bound handlers for proper cleanup
  private boundHandleIncomingMessage: MessageHandler;
  private boundHandlePeerConnect: MessageHandler;
  private boundHandlePeerDisconnect: MessageHandler;

  constructor(realTimeController: RealTimeController, actorId: string) {
    this.rtc = realTimeController;
    this.actorId = actorId;
    
    // Bind handlers once for proper cleanup
    this.boundHandleIncomingMessage = this.handleIncomingMessage.bind(this);
    this.boundHandlePeerConnect = this.handlePeerConnect.bind(this);
    this.boundHandlePeerDisconnect = this.handlePeerDisconnect.bind(this);
    
    this.setupEventHandlers();
  }

  /**
   * Set up event handlers for RealTimeController
   */
  private setupEventHandlers(): void {
    // Handle incoming sync messages
    this.rtc.on('AUTOMERGE_PROTOCOL', this.boundHandleIncomingMessage);
    
    // Handle peer connections
    this.rtc.on('USER_CONNECT', this.boundHandlePeerConnect);
    
    // Handle peer disconnections
    this.rtc.on('USER_DISCONNECT', this.boundHandlePeerDisconnect);

  }

  /**
   * Handle incoming sync messages
   */
  private handleIncomingMessage(message: unknown): void {
    if (!MessageTypeGuards.isAutomergeSyncMessage(message)) {
      return;
    }

    if (message.userId === this.actorId) {
      return; // Ignore own messages
    }

    
    // Convert array back to Uint8Array
    const syncMessage = new Uint8Array(message.syncMessage);
    
    // Forward to sync handler
    this.onSyncMessage?.(message.userId, syncMessage);
  }

  /**
   * Handle peer connection events
   */
  private handlePeerConnect(event: unknown): void {
    if (!MessageTypeGuards.isPeerConnectionEvent(event)) {
      return;
    }

    if (event.userId === this.actorId) {
      return; // Ignore self
    }

    Logger.INFO('[CRDT] Peer connected:', event.userId);
    this.onPeerConnect?.(event.userId);
  }

  /**
   * Handle peer disconnection events
   */
  private handlePeerDisconnect(event: unknown): void {
    if (!MessageTypeGuards.isPeerConnectionEvent(event)) {
      return;
    }

    Logger.INFO('[CRDT] Peer disconnected:', event.userId);
    this.onPeerDisconnect?.(event.userId);
  }

  /**
   * Send sync message to a specific peer
   */
  sendSyncMessage(peerId: string, message: Uint8Array): void {
    if (!this.rtc.isWebSocketConnected()) {
      return;
    }

    const messageData: AutomergeSyncMessage = {
      syncMessage: Array.from(message),
      userId: this.actorId
    };

    this.rtc.sendToPeer(peerId, 'AUTOMERGE_PROTOCOL', messageData);
  }

  /**
   * Broadcast sync message to multiple peers
   */
  broadcastSyncMessage(peerIds: string[], message: Uint8Array): void {
    peerIds.forEach(peerId => {
      this.sendSyncMessage(peerId, message);
    });
  }

  /**
   * Update the actor ID for this bridge
   */
  updateActorId(actorId: string): void {
    this.actorId = actorId;
  }

  /**
   * Set callback for sync message events
   */
  onSyncMessageReceived(callback: (peerId: string, message: Uint8Array) => void): void {
    this.onSyncMessage = callback;
  }

  /**
   * Set callback for peer connect events
   */
  onPeerConnected(callback: (peerId: string) => void): void {
    this.onPeerConnect = callback;
  }

  /**
   * Set callback for peer disconnect events
   */
  onPeerDisconnected(callback: (peerId: string) => void): void {
    this.onPeerDisconnect = callback;
  }

  /**
   * Clean up event handlers
   */
  dispose(): void {
    this.rtc.off('AUTOMERGE_PROTOCOL', this.boundHandleIncomingMessage);
    this.rtc.off('USER_CONNECT', this.boundHandlePeerConnect);
    this.rtc.off('USER_DISCONNECT', this.boundHandlePeerDisconnect);
    
    this.onSyncMessage = undefined;
    this.onPeerConnect = undefined;
    this.onPeerDisconnect = undefined;
  }
}
