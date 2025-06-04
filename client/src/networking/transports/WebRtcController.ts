import { dispatch } from '../../app/store';
import { Transport } from '../../constants';
import { connectionActions } from '../../slices/connectionSlice';
import AbstractNetworkController, { Message } from '../AbstractNetworkController';
import WebsocketController from './WebsocketController';
import SimplePeer from 'simple-peer';

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
  }

  public static getInstance(): WebRtcController {
    if (!WebRtcController.instance) {
      WebRtcController.instance = new WebRtcController();
    }

    return WebRtcController.instance;
  }

  public broadcast<T extends Message>(action: string, message: T) {
    this.activePeerIds.forEach(peerId => {
      this.sendToPeer(peerId, action, message);
    });
  }

  public sendToPeers<T extends Message>(peerIds: string[], action: string, message: T) {
    peerIds.forEach(peerId => {
      this.sendToPeer(peerId, action, message);
    })
  }

  public sendToPeer<T extends Message>(peerId: string, action: string, message: T) {
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
    if (!this.initiator) {
      this.addPeer(userId);
    }

    this.peers.get(userId)?.signal(signalData);
  }

  private onPeerJoined(message: UserPayload) {
    this.initiator = true;
    this.addPeer(message.userId);
  }

  private addPeer(userId: string) {
    const p = new SimplePeer({
      initiator: this.initiator,
      trickle: false,
    });

    p.on(PEER_EVENT.CONNECT, () => {
      this.activePeerIds.add(userId);
      dispatch(connectionActions.setPeerTransport({
        peerId: userId,
        transport: Transport.WEBRTC,
      }));
    });

    p.on(PEER_EVENT.SIGNAL, signalData => {
      this.websocketController.broadcast(ACTION.SIGNAL, {
        userId,
        signalData,
      });
    });

    p.on(PEER_EVENT.CLOSE, () => {
      this.peers.delete(userId);
      this.activePeerIds.delete(userId);
      dispatch(connectionActions.setPeerTransport({
        peerId: userId,
        transport: Transport.WEBSOCKETS,
      }));
    });

    p.on(PEER_EVENT.DATA, data => {
      const message = JSON.parse(this.textDecoder.decode(data));
      const callbacks = this.messageHandlers.get(message.action);
      callbacks?.forEach(cb => cb({ ...message.payload, userId }));
    });

    this.peers.set(userId, p);
  }
}
