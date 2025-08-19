import SimplePeer from 'simple-peer';
import { updatePeerTransport } from '../../actions/ConnectionActions';
import { store } from '../../app/store';
import { decodeEnvelope, encodeEnvelope } from '../../codecs/EventCodec';
import { Transport } from '../../constants';
import Logger from '../../lib/Logger';
import { requestIdleCallback } from '../../lib/ponyfill';
import { selectPeerConnection } from '../../selectors/connectionSelectors';
import AbstractNetworkController, { type Message } from '../AbstractNetworkController';
import WebsocketController from './WebsocketController';

// SimplePeer uses the err-code library internally to add error codes to Error objects
interface SimplePeerError extends Error {
  code?: string;
}


type UserPayload = {
  userId: string;
};

type SignalPayload = {
  userId: string;
  signalData: SimplePeer.SignalData;
};

export const ACTION = {
  SIGNAL: 'SIGNAL',
  PEER_JOINED: 'PEER_JOINED',
  USER_CONNECT: 'USER_CONNECT',
  USER_DISCONNECT: 'USER_DISCONNECT',
} as const;

const PEER_EVENT = {
  CLOSE: 'close',
  CONNECT: 'connect',
  DATA: 'data',
  SIGNAL: 'signal',
  ERROR: 'error',
} as const;


export default class WebRtcController extends AbstractNetworkController {
  private static instance?: WebRtcController;
  private static MAX_CONNECTION_ATTEMPTS = 4;
  private static RETRYABLE_ERROR_CODES = [
    'ERR_CONNECTION_FAILURE',
    'ERR_ICE_CONNECTION_FAILURE',
    'ERR_ICE_CONNECTION_CLOSED'
  ];
  private websocketController: WebsocketController;
  private initiator = false;
  private peers = new Map<string, SimplePeer.Instance>();
  private activePeerIds = new Set<string>();
  private pendingConnections = new Set<string>();

  private constructor() {
    super();
    this.websocketController = WebsocketController.getInstance();
    // we just joined, existing peer sent us a signal message
    this.websocketController.on(ACTION.SIGNAL, this.onSignalReceived.bind(this));
    // new user joins, we send signal message
    this.websocketController.on(ACTION.USER_CONNECT, this.onPeerJoined.bind(this));
    Logger.DEBUG('[WebRTC] Controller initialized');
  }

  public static getInstance(): WebRtcController {
    if (!WebRtcController.instance) {
      WebRtcController.instance = new WebRtcController();
    }

    return WebRtcController.instance;
  }

  public broadcast<T extends Message>(action: string, message?: T) {
    this.activePeerIds.forEach(peerId => {
      this.sendToPeer(peerId, action, message);
    });
  }

  public sendToPeers<T extends Message>(peerIds: string[], action: string, message?: T) {
    peerIds.forEach(peerId => {
      this.sendToPeer(peerId, action, message);
    });
  }

  public sendToPeer<T extends Message>(peerId: string, eventType: string, payload?: T) {
    const peer = this.peers.get(peerId);

    if (!peer || !this.activePeerIds.has(peerId)) {
      throw new Error('Cannot send message to unavailable peer');
    }

    peer.send(encodeEnvelope(eventType, payload));
  }

  public getActivePeerIds(): Set<string> {
    return this.activePeerIds;
  }

  static destroy() {
    WebRtcController.instance?.peers.forEach(peer => peer.destroy());
    WebRtcController.instance = undefined;
  }

  private onSignalReceived(message: SignalPayload) {
    const { userId, signalData } = message;
    Logger.DEBUG(`[WebRTC] Signal received from ${userId}: ${signalData.type}`);

    if (!this.initiator && !this.peers.has(userId)) {
      Logger.DEBUG(`[WebRTC] Creating peer for ${userId}`);
      this.addPeer(userId);
    }

    const peer = this.peers.get(userId);
    if (peer) {
      Logger.DEBUG(`[WebRTC] Applying ${signalData.type} signal to ${userId}`);
      peer.signal(signalData);
      return;
    }

    Logger.WARN(`[WebRTC] No peer found for ${userId}`);
  }

  private onPeerJoined(message: UserPayload) {
    Logger.DEBUG(`[WebRTC] Peer joined: ${message.userId}, becoming initiator`);
    this.initiator = true;
    this.addPeer(message.userId);
  }

  private addPeer(userId: string, attempt: number = 1) {
    const isInitiator = this.initiator; // capture now for later use in disconnect handler
    Logger.DEBUG(`[WebRTC] Adding peer ${userId}, initiator: ${isInitiator}`);

    // Check if we're already trying to connect to this peer
    if (this.pendingConnections.has(userId)) {
      Logger.DEBUG(`[WebRTC] Connection already pending for ${userId}, skipping duplicate attempt`);
      return;
    }

    if (this.peers.has(userId)) {
      Logger.WARN(`[WebRTC] Peer ${userId} already exists, destroying first`);
      const existingPeer = this.peers.get(userId);
      this.peers.delete(userId);
      this.activePeerIds.delete(userId);
      existingPeer?.destroy();
    }

    // Mark this connection as pending
    this.pendingConnections.add(userId);

    const peer = new SimplePeer({
      initiator: this.initiator,
      iceCompleteTimeout: 10000 // 10 seconds for slower devices like iPhones
    });
    Logger.DEBUG(`[WebRTC] Peer created for ${userId}`);

    // CRITICAL: Store peer immediately after creation, before any async operations.
    // This ensures incoming signals can find the peer even if they arrive before
    // connection setup completes (common on slower devices like iPhones)
    this.peers.set(userId, peer);

    peer.on(PEER_EVENT.CONNECT, () => {
      Logger.DEBUG(`[WebRTC] Peer ${userId} connected on attempt ${attempt}`);
      this.activePeerIds.add(userId);
      this.pendingConnections.delete(userId);
      updatePeerTransport(userId, Transport.WEBRTC);
    });

    peer.on(PEER_EVENT.SIGNAL, signalData => {
      Logger.DEBUG(`[WebRTC] Sending ${signalData.type} to ${userId}`);
      requestIdleCallback(() => this.websocketController.sendToPeer(userId, ACTION.SIGNAL, {
        userId,
        signalData,
      }));
    });

    peer.on(PEER_EVENT.CLOSE, () => {
      let message = `[WebRTC] Peer ${userId} connection closed`;
      if (peer.errored) {
        message += ` with error: ${peer.errored}`;
      }
      Logger.DEBUG(message);

      // Always remove from active peers and peers map immediately
      this.activePeerIds.delete(userId);
      this.peers.delete(userId);
      this.pendingConnections.delete(userId);

      const peerConnection = selectPeerConnection(userId)(store);
      if (peerConnection) {
        updatePeerTransport(userId, Transport.WEBSOCKET);
      }

    });

    peer.on(PEER_EVENT.DATA, data => {
      try {
        const { eventType, payload } = decodeEnvelope(data);
        Logger.DEBUG(`[WebRTC] Data from ${userId}: ${eventType}`);
        const callbacks = this.messageHandlers.get(eventType);
        callbacks?.forEach(cb => cb({ ...payload, userId }));
      } catch (error) {
        Logger.ERROR(`[WebRTC] Parse error from ${userId}: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    });

    peer.on(PEER_EVENT.ERROR, (err: SimplePeerError) => {
      Logger.DEBUG(`[WebRTC] Error ${userId}: ${err.message}`);

      const peerConnection = selectPeerConnection(userId)(store);

      // Only attempt reconnection for connection-related failures
      if (isInitiator &&
        peerConnection &&
        attempt <= WebRtcController.MAX_CONNECTION_ATTEMPTS &&
        err.code &&
        WebRtcController.RETRYABLE_ERROR_CODES.includes(err.code)
      ) {
        Logger.DEBUG(`[WebRTC] Connection error ${err.code}, retrying (attempt ${attempt + 1})`);

        // Remove failed peer and retry immediately
        this.peers.delete(userId);
        this.activePeerIds.delete(userId);
        this.pendingConnections.delete(userId);
        this.addPeer(userId, attempt + 1);
      }
    });

    Logger.DEBUG(`[WebRTC] Peer ${userId} added`);
  }
}
