import { dispatch } from '../app/store';
import { Payload, Transport } from '../constants';
import { getWorkspace } from '../lib/WorkspaceHelper';
import { downgradeConnection, setConnection } from '../slices/workspaceSlice';
import NetworkController from './NetworkController';
import WebsocketController from './WebsocketController';
import SimplePeer from 'simple-peer';

type UserConnectPayload = {
  userId: string;
};

type SignalPayload = {
  userId: string;
  signalData: SimplePeer.SignalData;
};

const ACTION = {
  SIGNAL: 'SIGNAL',
  PEER_JOINED: 'PEER_JOINED',
  USER_CONNECT: 'USER_CONNECT',
} as const;

const PEER_EVENT = {
  CLOSE: 'close',
  CONNECT: 'connect',
  DATA: 'data',
  SIGNAL: 'signal',
} as const;


/**
 * This is in need of a refactor. The controller should not have a dependency on
 * the websocket controller, and rather be a wrapper for SimplePeer. This would
 * allow this controller to be generalized.
*/

export default class WebRtcController extends NetworkController {
  private static instance?: WebRtcController;
  private websocketController: WebsocketController;
  private initiator = false;
  private peers = new Map<string, SimplePeer.Instance>();
  private activeUserIds = new Set<string>();
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

  public broadcast(action: string, message: Payload) {
    const workspace = getWorkspace();
    const peerIds = Object.keys(workspace?.room?.users || {});

    const userIdsForWebsockets: string[] = [];

    peerIds.forEach(peerId => {
      // don't send message back to this client, only peers
      if (peerId === workspace.connectionId) {
        return;
      }

      try {
        this.sendToPeer(peerId, action, message);
      } catch {
        // fall back to websocket
        userIdsForWebsockets.push(peerId);
      }
    });

    // broadcast message to all peers that don't have an active webrtc connection
    if (userIdsForWebsockets.length) {
      WebsocketController.getInstance().send(action, {
        ...message,
        targetUserIds: userIdsForWebsockets,
      });
    }
  }

  public sendToPeer(peerId: string, action: string, message: Payload) {
    const peer = this.peers.get(peerId);

    if (!peer || !this.activeUserIds.has(peerId)) {
      throw new Error('Cannot send message to unavailable peer');
    }

    peer.send(JSON.stringify({
      action,
      payload: message,
    }));
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

  private onPeerJoined(message: UserConnectPayload) {
    this.initiator = true;
    this.addPeer(message.userId);
  }

  private addPeer(userId: string) {
    const p = new SimplePeer({
      initiator: this.initiator,
      trickle: false,
    });

    p.on(PEER_EVENT.CONNECT, () => {
      this.activeUserIds.add(userId);
      dispatch(setConnection({
        userId,
        transport: Transport.WEBRTC,
      }));
    });

    p.on(PEER_EVENT.SIGNAL, signalData => {
      this.websocketController.send(ACTION.SIGNAL, {
        userId,
        signalData,
      });
    });

    p.on(PEER_EVENT.CLOSE, () => {
      this.peers.delete(userId);
      this.activeUserIds.delete(userId);
      dispatch(downgradeConnection({ userId }));
    });

    p.on(PEER_EVENT.DATA, data => {
      const message = JSON.parse(this.textDecoder.decode(data));
      const callbacks = this.messageHandlers.get(message.action);
      callbacks?.forEach(cb => cb({ ...message.payload, userId }));
    });

    this.peers.set(userId, p);
  }
}
