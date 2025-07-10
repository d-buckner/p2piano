import SimplePeer from 'simple-peer';
import { updatePeerTransport } from '../../actions/ConnectionActions';
import { Transport } from '../../constants';
import Logger from '../../lib/Logger';
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

  private addPeer(userId: string) {
    Logger.DEBUG(`[WebRTC] Adding peer ${userId}, initiator: ${this.initiator}`);

    if (this.peers.has(userId)) {
      Logger.WARN(`[WebRTC] Peer ${userId} already exists, destroying first`);
      this.peers.get(userId)?.destroy();
      this.peers.delete(userId);
      this.activePeerIds.delete(userId);
    }

    const p = new SimplePeer({ initiator: this.initiator });
    Logger.DEBUG(`[WebRTC] SimplePeer created for ${userId}`);

    p.on(PEER_EVENT.CONNECT, () => {
      Logger.DEBUG(`[WebRTC] Peer ${userId} CONNECTED`);
      this.activePeerIds.add(userId);
      updatePeerTransport(userId, Transport.WEBRTC);
    });

    p.on(PEER_EVENT.SIGNAL, signalData => {
      Logger.DEBUG(`[WebRTC] Sending ${signalData.type} to ${userId}`);
      requestIdleCallback(() => this.websocketController.sendToPeer(userId, ACTION.SIGNAL, {
        userId,
        signalData,
      }));
    });

    p.on(PEER_EVENT.CLOSE, () => {
      Logger.DEBUG(`[WebRTC] Peer ${userId} connection closed`);
      this.peers.delete(userId);
      this.activePeerIds.delete(userId);
      updatePeerTransport(userId, Transport.WEBSOCKET);
    });

    p.on(PEER_EVENT.DATA, data => {
      try {
        const message = JSON.parse(this.textDecoder.decode(data));
        Logger.DEBUG(`[WebRTC] Data from ${userId}: ${message.action}`);
        const callbacks = this.messageHandlers.get(message.action);
        callbacks?.forEach(cb => cb({ ...message.payload, userId }));
      } catch (error) {
        Logger.ERROR(`[WebRTC] Parse error from ${userId}: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    });

    p.on(PEER_EVENT.ERROR, err => {
      Logger.ERROR(`[WebRTC] Error ${userId}: ${err.message}`);
    });

    this.peers.set(userId, p);
    Logger.DEBUG(`[WebRTC] Peer ${userId} added`);
  }
}
