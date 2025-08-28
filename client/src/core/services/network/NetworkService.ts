import { store } from '../../../app/store';
import { Transport } from '../../../constants';
import Logger from '../../../lib/Logger';
import WebRtcController from '../../../networking/transports/WebRtcController';
import WebsocketController from '../../../networking/transports/WebsocketController';
import { selectConnectedPeerIds, selectPeerConnection } from '../../../selectors/connectionSelectors';
import type { INetworkService, NetworkConnectionParams, MessageCodec, MessageHandler } from './INetworkService';


export class NetworkService implements INetworkService {
  private websocketController: WebsocketController;
  private webrtcController: WebRtcController;
  private codecs = new Map<string, MessageCodec<unknown>>();
  private messageHandlers = new Map<string, Set<MessageHandler<unknown>>>();
  private isConnectedState = false;

  constructor() {
    this.websocketController = WebsocketController.getInstance();
    this.webrtcController = WebRtcController.getInstance();
  }

  public async connect(connectionParams: NetworkConnectionParams): Promise<void> {
    Logger.INFO('NetworkService connecting with params:', connectionParams);
    
    // For now, delegate to WebSocket controller with the domain-agnostic networkId
    // The WebSocket controller will interpret this as roomId internally
    this.websocketController.connect();
    this.isConnectedState = true;
  }

  public disconnect(): void {
    this.websocketController.destroy();
    this.webrtcController.destroy();
    this.isConnectedState = false;
  }

  public isConnected(): boolean {
    return this.isConnectedState;
  }

  public registerCodec<T>(messageType: string, codec: MessageCodec<T>): void {
    this.codecs.set(messageType, codec);
  }

  public unregisterCodec(messageType: string): void {
    this.codecs.delete(messageType);
  }

  public broadcast<T>(messageType: string, payload: T): void {
    const encodedPayload = this.encodeMessage(messageType, payload);
    
    // Use existing RealTimeController logic for transport selection
    const websocketPeerIds: string[] = [];

    selectConnectedPeerIds(store).forEach((peerId: string) => {
      this.sendWithFallback(peerId, messageType, encodedPayload, () => {
        websocketPeerIds.push(peerId);
      });
    });

    if (websocketPeerIds.length) {
      this.websocketController.sendToPeers(websocketPeerIds, messageType, encodedPayload);
    }
  }

  public send<T>(peerId: string, messageType: string, payload: T): void {
    const encodedPayload = this.encodeMessage(messageType, payload);
    
    this.sendWithFallback(peerId, messageType, encodedPayload, () => {
      this.websocketController.sendToPeer(peerId, messageType, encodedPayload);
    });
  }

  public onMessage<T>(messageType: string, handler: MessageHandler<T>): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    this.messageHandlers.get(messageType)!.add(handler);

    // Create a wrapper that handles the senderId extraction and message decoding
    const transportHandler = (data: unknown) => {
      try {
        // Extract senderId from the message (following existing patterns)
        const message = data as { userId?: string; senderId?: string };
        const senderId = message?.userId || message?.senderId || 'unknown';
        const decodedPayload = this.decodeMessage<T>(messageType, data);
        handler(decodedPayload, senderId);
      } catch (error) {
        Logger.ERROR(`Error handling message ${messageType}:`, error);
      }
    };

    // Register the handler on both transport controllers
    this.webrtcController.on(messageType, transportHandler);
    this.websocketController.on(messageType, transportHandler);
  }

  public offMessage(messageType: string, handler: MessageHandler<unknown>): void {
    this.messageHandlers.get(messageType)?.delete(handler);
  }

  public getConnectedPeers(): string[] {
    return selectConnectedPeerIds(store);
  }

  public getPeerLatency(peerId: string): number {
    const connection = selectPeerConnection(store, peerId);
    return connection?.latency || 0;
  }

  private encodeMessage<T>(messageType: string, payload: T): unknown {
    const codec = this.codecs.get(messageType);
    
    if (codec) {
      // Use binary codec for optimized encoding
      return codec.encode(payload);
    } else {
      // Fallback to original payload (will be JSON serialized by transport)
      return payload;
    }
  }

  private decodeMessage<T>(messageType: string, data: unknown): T {
    const codec = this.codecs.get(messageType);
    
    if (codec && data instanceof Uint8Array) {
      // Decode binary data using codec
      return codec.decode(data);
    } else {
      // Return data as-is (already parsed by transport layer)
      return data;
    }
  }


  private sendWithFallback<T>(
    peerId: string,
    messageType: string,
    payload: T,
    onFallback: () => void
  ): void {
    const peerConnection = selectPeerConnection(store, peerId);
    
    if (peerConnection?.transport === Transport.WEBRTC) {
      try {
        this.webrtcController.sendToPeer(peerId, messageType, payload);
      } catch (error) {
        Logger.WARN(`WebRTC send failed for peer ${peerId}, falling back to WebSocket`, error);
        onFallback();
      }
    } else {
      onFallback();
    }
  }
}
