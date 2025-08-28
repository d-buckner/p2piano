// NetworkService interface - pure transport layer
export interface INetworkService {
  // Connection management
  connect(connectionParams: NetworkConnectionParams): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;
  
  // Codec registration system
  registerCodec<T>(messageType: string, codec: MessageCodec<T>): void;
  unregisterCodec(messageType: string): void;
  
  // Message transport
  broadcast<T>(messageType: string, payload: T): void;
  send<T>(peerId: string, messageType: string, payload: T): void;
  onMessage<T>(messageType: string, handler: MessageHandler<T>): void;
  offMessage<T>(messageType: string, handler: MessageHandler<T>): void;
  
  // Network state
  getConnectedPeers(): string[];
  getPeerLatency(peerId: string): number;
}

// Connection parameters for network initialization
export interface NetworkConnectionParams {
  networkId: string;      // Domain-agnostic network identifier
  displayName: string;    // User identifier for this network
  endpoint?: string;      // Optional custom endpoint
}

// Message codec interface for binary encoding/decoding
export interface MessageCodec<T> {
  encode(payload: T): Uint8Array;
  decode(data: Uint8Array): T;
}

// Message handler type
export type MessageHandler<T> = (payload: T, senderId: string) => void;
