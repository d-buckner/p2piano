/**
 * TypeScript interfaces for CRDT message types.
 * Provides type safety for all Automerge sync communication.
 */

/**
 * Peer connection event data
 */
export interface UserConnectMessage {
  userId: string;
}

export interface UserDisconnectMessage {
  userId: string;
}

/**
 * Base structure for all CRDT protocol messages
 */
export interface CRDTMessage {
  /** User ID of the sender */
  userId: string;
}

/**
 * Automerge sync message containing document changes
 */
export interface AutomergeSyncMessage extends CRDTMessage {
  /** Serialized Automerge sync message data */
  syncMessage: number[];
}

/**
 * Callback type for CRDT sync events
 */
export type CRDTSyncCallback = (userId: string, data: Uint8Array) => void;

/**
 * Type guards for runtime type checking
 */
export const MessageTypeGuards = {
  /**
   * Check if a message is a valid CRDT message
   */
  isCRDTMessage(message: unknown): message is CRDTMessage {
    return (
      typeof message === 'object' &&
      message !== null &&
      'userId' in message &&
      typeof (message as { userId?: unknown }).userId === 'string'
    );
  },

  /**
   * Check if a message is a valid Automerge sync message
   */
  isAutomergeSyncMessage(message: unknown): message is AutomergeSyncMessage {
    return (
      this.isCRDTMessage(message) &&
      'syncMessage' in message &&
      Array.isArray((message as { syncMessage?: unknown }).syncMessage)
    );
  },

  /**
   * Check if an event is a valid peer connection event
   */
  isPeerConnectionEvent(event: unknown): event is UserConnectMessage | UserDisconnectMessage {
    return (
      typeof event === 'object' &&
      event !== null &&
      'userId' in event &&
      typeof (event as { userId?: unknown }).userId === 'string'
    );
  },
};
