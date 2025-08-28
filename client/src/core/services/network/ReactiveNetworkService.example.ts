import { Service } from '../base/Service';
import type { INetworkService, NetworkConnectionParams, MessageCodec, MessageHandler } from './INetworkService';

// Define the reactive state interface for NetworkService
interface NetworkServiceState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  connectedPeers: string[];
  lastError: string | null;
  messageCount: number;
}

/**
 * Example of how NetworkService could extend the reactive Service base class
 * This demonstrates the pattern without modifying the existing NetworkService
 */
export class ReactiveNetworkService extends Service<NetworkServiceState> implements INetworkService {
  private originalService: INetworkService;

  constructor(originalService: INetworkService) {
    // Initialize with default reactive state
    super({
      connectionStatus: 'disconnected',
      connectedPeers: [],
      lastError: null,
      messageCount: 0
    });
    
    this.originalService = originalService;
  }

  public async connect(connectionParams: NetworkConnectionParams): Promise<void> {
    this.setState('connectionStatus', 'connecting');
    this.setState('lastError', null);

    try {
      await this.originalService.connect(connectionParams);
      this.setState('connectionStatus', 'connected');
    } catch (error) {
      this.setState('connectionStatus', 'disconnected');
      this.setState('lastError', error instanceof Error ? error.message : 'Connection failed');
      throw error;
    }
  }

  public disconnect(): void {
    this.originalService.disconnect();
    this.setStates({
      connectionStatus: 'disconnected',
      connectedPeers: [],
      lastError: null
    });
  }

  public isConnected(): boolean {
    return this.getState('connectionStatus') === 'connected';
  }

  // Delegate other INetworkService methods to original service
  public registerCodec<T>(messageType: string, codec: MessageCodec<T>): void {
    this.originalService.registerCodec(messageType, codec);
  }

  public unregisterCodec(messageType: string): void {
    this.originalService.unregisterCodec(messageType);
  }

  public broadcast<T>(messageType: string, payload: T): void {
    this.originalService.broadcast(messageType, payload);
    this.setState('messageCount', this.getState('messageCount') + 1);
  }

  public send<T>(messageType: string, payload: T, peerId: string): void {
    this.originalService.send(messageType, payload, peerId);
    this.setState('messageCount', this.getState('messageCount') + 1);
  }

  public onMessage<T>(messageType: string, handler: MessageHandler<T>): () => void {
    return this.originalService.onMessage(messageType, handler);
  }

  public offMessage<T>(messageType: string, handler: MessageHandler<T>): void {
    this.originalService.offMessage(messageType, handler);
  }

  // Additional reactive-specific methods
  public addPeer(peerId: string): void {
    const currentPeers = this.getState('connectedPeers');
    if (!currentPeers.includes(peerId)) {
      this.setState('connectedPeers', [...currentPeers, peerId]);
    }
  }

  public removePeer(peerId: string): void {
    const currentPeers = this.getState('connectedPeers');
    this.setState('connectedPeers', currentPeers.filter(id => id !== peerId));
  }
}
