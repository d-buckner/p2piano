import { dispatch } from '../../app/store';
import { Transport } from '../../constants';
import Logger from '../../lib/Logger';
import { connectionActions } from '../../slices/connectionSlice';
import AbstractNetworkController, { type Message } from '../AbstractNetworkController';
import WebsocketController from './WebsocketController';

type UserPayload = {
  userId: string;
};

type SignalPayload = {
  userId: string;
  signalData: {
    type: 'offer' | 'answer' | 'ice-candidate';
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
  };
};

export const ACTION = {
  SIGNAL: 'SIGNAL',
  PEER_JOINED: 'PEER_JOINED',
  USER_CONNECT: 'USER_CONNECT',
  USER_DISCONNECT: 'USER_DISCONNECT',
} as const;

const SIGNAL_TYPE = {
  OFFER: 'offer',
  ANSWER: 'answer',
  ICE_CANDIDATE: 'ice-candidate',
} as const;

const CONNECTION_STATE = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed',
} as const;

const DATA_CHANNEL = {
  LABEL: 'messages',
} as const;

const ICE_SERVERS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
];

interface PeerConnection {
  pc: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  isConnected: boolean;
}

export default class WebRtcController extends AbstractNetworkController {
  private static instance?: WebRtcController;
  private websocketController: WebsocketController;
  private peers = new Map<string, PeerConnection>();
  private activePeerIds = new Set<string>();
  private offerQueue: SignalPayload[] = [];
  private processingOffer = false;

  private constructor() {
    super();
    this.websocketController = WebsocketController.getInstance();
    this.websocketController.on(ACTION.SIGNAL, this.onSignalReceived.bind(this));
    this.websocketController.on(ACTION.USER_CONNECT, this.onPeerJoined.bind(this));
    Logger.DEBUG('[WebRTC] Controller initialized');
  }

  public static getInstance(): WebRtcController {
    if (!WebRtcController.instance) {
      WebRtcController.instance = new WebRtcController();
    }
    return WebRtcController.instance;
  }

  public broadcast<T extends Message>(action: string, message: T) {
    Logger.DEBUG(`[WebRTC] Broadcasting ${action} to ${this.activePeerIds.size} peers`);
    this.activePeerIds.forEach(peerId => {
      this.sendToPeer(peerId, action, message);
    });
  }

  public sendToPeers<T extends Message>(peerIds: string[], action: string, message: T) {
    Logger.DEBUG(`[WebRTC] Sending ${action} to specific peers: [${peerIds.join(', ')}]`);
    peerIds.forEach(peerId => {
      this.sendToPeer(peerId, action, message);
    });
  }

  public sendToPeer<T extends Message>(peerId: string, action: string, message: T) {
    const peer = this.peers.get(peerId);

    if (!peer?.dataChannel || !this.activePeerIds.has(peerId)) {
      Logger.WARN(`[WebRTC] Cannot send ${action} to unavailable peer ${peerId}`);
      throw new Error('Cannot send message to unavailable peer');
    }

    Logger.DEBUG(`[WebRTC] Sending ${action} to peer ${peerId}`);
    peer.dataChannel.send(JSON.stringify({
      action,
      payload: message,
    }));
  }

  public getActivePeerIds(): Set<string> {
    return this.activePeerIds;
  }

  static destroy() {
    const peerCount = WebRtcController.instance?.peers.size || 0;
    Logger.DEBUG(`[WebRTC] Destroying controller with ${peerCount} peers`);

    WebRtcController.instance?.peers.forEach((peer, userId) => {
      Logger.DEBUG(`[WebRTC] Cleaning up peer ${userId}`);
      peer.dataChannel?.close();
      peer.pc.close();
    });
    WebRtcController.instance = undefined;
  }

  private async onSignalReceived(message: SignalPayload) {
    const { userId, signalData } = message;
    const peerExists = this.peers.has(userId);

    Logger.DEBUG(`[WebRTC] Signal received: ${signalData.type} from ${userId} (peer exists: ${peerExists}, total peers: ${this.peers.size})`);

    if (!peerExists) {
      await this.createPeerConnection(userId, false);
    }

    const peer = this.peers.get(userId);
    if (!peer) {
      Logger.ERROR(`[WebRTC] Failed to get peer ${userId} after creation`);
      return;
    }

    try {
      switch (signalData.type) {
        case SIGNAL_TYPE.OFFER:
          await this.handleOffer(message);
          break;
        case SIGNAL_TYPE.ANSWER:
          Logger.DEBUG(`[WebRTC] Setting remote description (answer) for ${userId}`);
          await peer.pc.setRemoteDescription(signalData.answer!);
          Logger.DEBUG(`[WebRTC] Remote description set successfully for ${userId}`);
          break;
        case SIGNAL_TYPE.ICE_CANDIDATE:
          Logger.DEBUG(`[WebRTC] Adding ICE candidate for ${userId}`);
          await peer.pc.addIceCandidate(signalData.candidate!);
          break;
      }
    } catch (error) {
      Logger.ERROR(`[WebRTC] Error handling ${signalData.type} from ${userId}: ${error}`);
    }
  }

  private async onPeerJoined(message: UserPayload) {
    Logger.DEBUG(`[WebRTC] New peer joined: ${message.userId} (current peers: ${this.peers.size})`);
    await this.createPeerConnection(message.userId, true);
  }

  private async handleOffer(message: SignalPayload) {
    const { userId } = message;

    if (this.processingOffer) {
      Logger.DEBUG(`[WebRTC] Offer processing in progress, queueing offer from ${userId} (queue size: ${this.offerQueue.length})`);
      this.offerQueue.push(message);
      return;
    }

    await this.processOffer(message);
    await this.processQueuedOffers();
  }

  private async processOffer(message: SignalPayload) {
    const { userId, signalData } = message;
    const peer = this.peers.get(userId);
    if (!peer) {
      Logger.ERROR(`[WebRTC] Cannot process offer: peer ${userId} not found`);
      return;
    }

    this.processingOffer = true;
    Logger.DEBUG(`[WebRTC] Processing offer from ${userId} (signaling state: ${peer.pc.signalingState})`);

    try {
      await peer.pc.setRemoteDescription(signalData.offer!);
      Logger.DEBUG(`[WebRTC] Remote description set for ${userId} (new state: ${peer.pc.signalingState})`);

      const answer = await peer.pc.createAnswer();
      Logger.DEBUG(`[WebRTC] Answer created for ${userId}`);

      await peer.pc.setLocalDescription(answer);
      Logger.DEBUG(`[WebRTC] Local description set for ${userId} (final state: ${peer.pc.signalingState})`);

      this.websocketController.broadcast(ACTION.SIGNAL, {
        userId,
        signalData: { type: SIGNAL_TYPE.ANSWER, answer },
      });
      Logger.DEBUG(`[WebRTC] Answer sent to ${userId}`);
    } catch (error) {
      Logger.ERROR(`[WebRTC] Failed to process offer from ${userId}: ${error}`);
    } finally {
      this.processingOffer = false;
    }
  }

  private async processQueuedOffers() {
    if (this.offerQueue.length === 0) return;

    Logger.DEBUG(`[WebRTC] Processing ${this.offerQueue.length} queued offers`);

    while (this.offerQueue.length > 0 && !this.processingOffer) {
      const queuedOffer = this.offerQueue.shift()!;
      Logger.DEBUG(`[WebRTC] Processing queued offer from ${queuedOffer.userId} (${this.offerQueue.length} remaining)`);
      await this.processOffer(queuedOffer);
    }
  }

  private async createPeerConnection(userId: string, isInitiator: boolean) {
    Logger.DEBUG(`[WebRTC] Creating peer connection: ${userId} (initiator: ${isInitiator}, existing peers: [${Array.from(this.peers.keys()).join(', ')}])`);

    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS.map(url => ({ urls: url })),
      iceCandidatePoolSize: 10, // Generate more ICE candidates
      iceTransportPolicy: 'all' // Use all available transports
    });

    const peer: PeerConnection = { pc, isConnected: false };
    this.peers.set(userId, peer);

    this.setupPeerConnectionHandlers(pc, peer, userId);

    if (isInitiator) {
      await this.setupInitiatorConnection(pc, peer, userId);
    } else {
      this.setupResponderConnection(pc, peer, userId);
    }

    Logger.DEBUG(`[WebRTC] Peer connection created for ${userId} (total peers: ${this.peers.size})`);
  }

  private setupPeerConnectionHandlers(pc: RTCPeerConnection, peer: PeerConnection, userId: string) {
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        Logger.DEBUG(`[WebRTC] ICE candidate generated for ${userId}`);
        this.websocketController.broadcast(ACTION.SIGNAL, {
          userId,
          signalData: { type: SIGNAL_TYPE.ICE_CANDIDATE, candidate: event.candidate },
        });
      } else {
        Logger.DEBUG(`[WebRTC] ICE gathering complete for ${userId}`);
      }
    };

    pc.oniceconnectionstatechange = () => {
      Logger.DEBUG(`[WebRTC] ICE connection state changed for ${userId}: ${pc.iceConnectionState}`);
    };

    pc.onconnectionstatechange = () => {
      Logger.DEBUG(`[WebRTC] Connection state changed for ${userId}: ${pc.connectionState}`);

      if (pc.connectionState === CONNECTION_STATE.CONNECTED) {
        peer.isConnected = true;
        this.activePeerIds.add(userId);
        Logger.DEBUG(`[WebRTC] Peer ${userId} connected successfully (active peers: ${this.activePeerIds.size})`);

        dispatch(connectionActions.setPeerTransport({
          peerId: userId,
          transport: Transport.WEBRTC,
        }));
      } else if (pc.connectionState === CONNECTION_STATE.FAILED) {
        Logger.WARN(`[WebRTC] Peer ${userId} ${pc.connectionState}, cleaning up`);
        this.cleanupPeer(userId);
      }
    };
  }

  private async setupInitiatorConnection(pc: RTCPeerConnection, peer: PeerConnection, userId: string) {
    Logger.DEBUG(`[WebRTC] Setting up initiator connection for ${userId}`);

    const dataChannel = pc.createDataChannel(DATA_CHANNEL.LABEL, { ordered: true });
    peer.dataChannel = dataChannel;
    this.setupDataChannel(dataChannel, userId);
    Logger.DEBUG(`[WebRTC] Data channel created for ${userId}`);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    Logger.DEBUG(`[WebRTC] Offer created and set for ${userId} (signaling state: ${pc.signalingState})`);

    this.websocketController.broadcast(ACTION.SIGNAL, {
      userId,
      signalData: { type: SIGNAL_TYPE.OFFER, offer },
    });
    Logger.DEBUG(`[WebRTC] Offer sent to ${userId}`);
  }

  private setupResponderConnection(pc: RTCPeerConnection, peer: PeerConnection, userId: string) {
    Logger.DEBUG(`[WebRTC] Setting up responder connection for ${userId}`);

    pc.ondatachannel = (event) => {
      Logger.DEBUG(`[WebRTC] Data channel received from ${userId} (label: ${event.channel.label})`);
      peer.dataChannel = event.channel;
      this.setupDataChannel(event.channel, userId);
    };
  }

  private setupDataChannel(dataChannel: RTCDataChannel, userId: string) {
    dataChannel.onopen = () => {
      Logger.DEBUG(`[WebRTC] Data channel opened for ${userId} (ready state: ${dataChannel.readyState})`);
    };

    dataChannel.onclose = () => {
      Logger.DEBUG(`[WebRTC] Data channel closed for ${userId}`);
    };

    dataChannel.onerror = (error) => {
      Logger.ERROR(`[WebRTC] Data channel error for ${userId}: ${error}`);
    };

    dataChannel.onmessage = (event) => {
      Logger.DEBUG(`[WebRTC] Message received from ${userId} (size: ${event.data.length} bytes)`);
      const message = JSON.parse(event.data);
      const callbacks = this.messageHandlers.get(message.action);
      callbacks?.forEach(cb => cb({ ...message.payload, userId }));
    };
  }

  private cleanupPeer(userId: string) {
    Logger.DEBUG(`[WebRTC] Cleaning up peer ${userId}`);

    this.peers.delete(userId);
    this.activePeerIds.delete(userId);

    Logger.DEBUG(`[WebRTC] Peer ${userId} cleaned up (remaining peers: ${this.peers.size}, active: ${this.activePeerIds.size})`);

    dispatch(connectionActions.setPeerTransport({
      peerId: userId,
      transport: Transport.WEBSOCKET,
    }));
  }
}
