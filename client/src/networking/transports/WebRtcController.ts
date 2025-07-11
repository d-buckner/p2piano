import SimplePeer from 'simple-peer';
import { updatePeerTransport } from '../../actions/ConnectionActions';
import { store } from '../../app/store';
import { Transport } from '../../constants';
import Logger from '../../lib/Logger';
import { requestIdleCallback } from '../../lib/ponyfill';
import { selectPeerConnection } from '../../selectors/connectionSelectors';
import AbstractNetworkController, { type Message } from '../AbstractNetworkController';
import WebsocketController from './WebsocketController';


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
  private static MAX_CONNECTION_ATTEMPTS = 3;
  private static RECONNECT_DELAY = 2000;
  private websocketController: WebsocketController;
  private initiator = false;
  private peers = new Map<string, SimplePeer.Instance>();
  private activePeerIds = new Set<string>();
  private textDecoder = new TextDecoder();

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

  public sendToPeer<T extends Message>(peerId: string, action: string, message?: T) {
    const peer = this.peers.get(peerId);

    if (!peer || !this.activePeerIds.has(peerId)) {
      throw new Error('Cannot send message to unavailable peer');
    }

    peer.send(JSON.stringify({
      action,
      payload: message,
    }));
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
    let stalePeer = false;
    const isInitiator = this.initiator; // capture now for later use in disconnect handler
    Logger.DEBUG(`[WebRTC] Adding peer ${userId}, initiator: ${isInitiator}`);

    if (this.peers.has(userId)) {
      Logger.WARN(`[WebRTC] Peer ${userId} already exists, destroying first`);
      this.peers.get(userId)?.destroy();
      this.peers.delete(userId);
      this.activePeerIds.delete(userId);
    }

    const peer = new SimplePeer({ initiator: this.initiator });
    Logger.DEBUG(`[WebRTC] Peer created for ${userId}`);

    if (this.initiator && attempt <= WebRtcController.MAX_CONNECTION_ATTEMPTS) {
      setTimeout(() => {
        if (!this.activePeerIds.has(userId)) {
          stalePeer = true;
          Logger.DEBUG(`[WebRTC] Attempt ${attempt} to connection to ${userId}`);
          peer.destroy();
          this.peers.delete(userId);
          this.addPeer(userId, attempt + 1);
        }
      }, WebRtcController.RECONNECT_DELAY);
    }

    peer.on(PEER_EVENT.CONNECT, () => {
      Logger.DEBUG(`[WebRTC] Peer ${userId} connected on attempt ${attempt}`);
      this.activePeerIds.add(userId);
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
      this.peers.delete(userId);
      this.activePeerIds.delete(userId);
      const peerConnection = selectPeerConnection(userId)(store);
      if (peerConnection) {
        updatePeerTransport(userId, Transport.WEBSOCKET);
      }

      if (isInitiator && peerConnection && !stalePeer) {
        // attempt reconnection
        this.addPeer(userId, attempt + 1);
      }
    });

    peer.on(PEER_EVENT.DATA, data => {
      try {
        const message = JSON.parse(this.textDecoder.decode(data));
        Logger.DEBUG(`[WebRTC] Data from ${userId}: ${message.action}`);
        const callbacks = this.messageHandlers.get(message.action);
        callbacks?.forEach(cb => cb({ ...message.payload, userId }));
      } catch (error) {
        Logger.ERROR(`[WebRTC] Parse error from ${userId}: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    });

    peer.on(PEER_EVENT.ERROR, err => {
      Logger.ERROR(`[WebRTC] Error ${userId}: ${err.message}`);
    });

    this.peers.set(userId, peer);
    Logger.DEBUG(`[WebRTC] Peer ${userId} added`);
  }
}
