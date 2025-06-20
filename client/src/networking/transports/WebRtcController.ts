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

interface PeerConnection {
  pc: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  isConnected: boolean;
}

export default class WebRtcController extends AbstractNetworkController {
  private static instance?: WebRtcController;
  private websocketController: WebsocketController;
  private pendingOffers = new Map<string, SignalPayload>();
  private processingOffer = false;
  private peers = new Map<string, PeerConnection>();
  private activePeerIds = new Set<string>();

  private constructor() {
    super();
    this.websocketController = WebsocketController.getInstance();
    this.websocketController.on(ACTION.SIGNAL, this.onSignalReceived.bind(this));
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
    });
  }

  public sendToPeer<T extends Message>(peerId: string, action: string, message: T) {
    const peer = this.peers.get(peerId);

    if (!peer?.dataChannel || !this.activePeerIds.has(peerId)) {
      throw new Error('Cannot send message to unavailable peer');
    }

    peer.dataChannel.send(JSON.stringify({
      action,
      payload: message,
    }));
  }

  public getActivePeerIds(): Set<string> {
    return this.activePeerIds;
  }

  static destroy() {
    WebRtcController.instance?.peers.forEach(peer => {
      peer.dataChannel?.close();
      peer.pc.close();
    });
    WebRtcController.instance = undefined;
  }

  private async onSignalReceived(message: SignalPayload) {
    const { userId, signalData } = message;

    Logger.INFO(`Received ${signalData.type} from ${userId}, existing peers: ${Array.from(this.peers.keys())}`);

    if (!this.peers.has(userId)) {
      await this.addPeer(userId, false);
    }

    const peer = this.peers.get(userId);
    if (!peer) return;

    try {
      if (signalData.type === 'offer') {
        // Queue offers if we're already processing one
        if (this.processingOffer) {
          Logger.INFO(`Queueing offer from ${userId}`);
          this.pendingOffers.set(userId, message);
          return;
        }

        await this.processOffer(message);

        // Process any queued offers
        for (const [queuedUserId, queuedMessage] of this.pendingOffers) {
          Logger.INFO(`Processing queued offer from ${queuedUserId}`);
          await this.processOffer(queuedMessage);
          this.pendingOffers.delete(queuedUserId);
        }
      } else if (signalData.type === 'answer') {
        await peer.pc.setRemoteDescription(signalData.answer!);
      } else if (signalData.type === 'ice-candidate') {
        await peer.pc.addIceCandidate(signalData.candidate!);
      }
    } catch (error) {
      Logger.ERROR(`Error handling signal: ${error}`);
    }
    //   if (signalData.type === 'offer') {
    //     Logger.INFO(`Processing offer from ${userId}`);
    //     await peer.pc.setRemoteDescription(signalData.offer!);
    //     Logger.INFO(`Remote description set for ${userId}`);

    //     const answer = await peer.pc.createAnswer();
    //     Logger.INFO(`Answer created for ${userId}`);

    //     await peer.pc.setLocalDescription(answer);
    //     Logger.INFO(`Local description set for ${userId}`);

    //     this.websocketController.broadcast(ACTION.SIGNAL, {
    //       userId,
    //       signalData: { type: 'answer', answer },
    //     });
    //     Logger.INFO(`Answer sent to ${userId}`);
    //   } else if (signalData.type === 'answer') {
    //     await peer.pc.setRemoteDescription(signalData.answer!);
    //   } else if (signalData.type === 'ice-candidate') {
    //     await peer.pc.addIceCandidate(signalData.candidate!);
    //   }
    // } catch (error) {
    //   Logger.ERROR(`Error handling signal: ${error}`);
    // }
  }

  private async onPeerJoined(message: UserPayload) {
    await this.addPeer(message.userId, true);
  }

  private async addPeer(userId: string, isInitiator: boolean) {
    Logger.INFO(`Adding peer: ${userId}, isInitiator: ${isInitiator}, existing peers: ${Array.from(this.peers.keys())}`);

    const pc = new RTCPeerConnection();
    if (!isInitiator) {
      Logger.INFO(`Setting up data channel listener for ${userId}`);
      pc.ondatachannel = (event) => {
        Logger.INFO(`Data channel received from ${userId}`);
        peer.dataChannel = event.channel;
        this.setupDataChannel(event.channel, userId);
      };
    }

    const peer: PeerConnection = { pc, isConnected: false };
    this.peers.set(userId, peer);

    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.websocketController.broadcast(ACTION.SIGNAL, {
          userId,
          signalData: { type: 'ice-candidate', candidate: event.candidate },
        });
      }
    };

    // Add ICE connection state logging
    pc.oniceconnectionstatechange = () => {
      Logger.INFO(`ICE connection state for ${userId}: ${pc.iceConnectionState}`);
    };

    // Connection state handling
    pc.onconnectionstatechange = () => {
      Logger.INFO(`Connection state for ${userId}: ${pc.connectionState}`);

      if (pc.connectionState === 'connected') {
        peer.isConnected = true;
        this.activePeerIds.add(userId);
        dispatch(connectionActions.setPeerTransport({
          peerId: userId,
          transport: Transport.WEBRTC,
        }));
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.peers.delete(userId);
        this.activePeerIds.delete(userId);
        dispatch(connectionActions.setPeerTransport({
          peerId: userId,
          transport: Transport.WEBSOCKET,
        }));
      }
    };

    // Data channel setup
    if (isInitiator) {
      Logger.INFO(`Creating data channel for ${userId}`);
      const dataChannel = pc.createDataChannel('messages', {
        ordered: true // Ensure ordered delivery
      });
      peer.dataChannel = dataChannel;
      this.setupDataChannel(dataChannel, userId);

      Logger.INFO(`Creating offer for ${userId}`);
      // Wait for ICE gathering to complete before creating offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      Logger.INFO(`Sending offer to ${userId}`);
      this.websocketController.broadcast(ACTION.SIGNAL, {
        userId,
        signalData: { type: 'offer', offer },
      });
    }
  }


  private setupDataChannel(dataChannel: RTCDataChannel, userId: string) {
    dataChannel.onopen = () => {
      Logger.INFO(`Data channel opened for peer: ${userId}`);
    };

    dataChannel.onclose = () => {
      Logger.INFO(`Data channel closed for peer: ${userId}`);
    };

    dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const callbacks = this.messageHandlers.get(message.action);
      callbacks?.forEach(cb => cb({ ...message.payload, userId }));
    };
  }

  private async processOffer(message: SignalPayload) {
    const { userId, signalData } = message;
    const peer = this.peers.get(userId);
    if (!peer) return;

    this.processingOffer = true;

    Logger.INFO(`Processing offer from ${userId}`);
    await peer.pc.setRemoteDescription(signalData.offer!);
    Logger.INFO(`Remote description set for ${userId}`);

    const answer = await peer.pc.createAnswer();
    Logger.INFO(`Answer created for ${userId}`);

    await peer.pc.setLocalDescription(answer);
    Logger.INFO(`Local description set for ${userId}`);

    this.websocketController.broadcast(ACTION.SIGNAL, {
      userId,
      signalData: { type: 'answer', answer },
    });
    Logger.INFO(`Answer sent to ${userId}`);

    this.processingOffer = false;
  }
}
