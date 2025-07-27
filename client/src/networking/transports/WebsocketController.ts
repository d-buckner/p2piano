import { io } from 'socket.io-client';
import { addPeerConnection, removePeerConnection } from '../../actions/ConnectionActions';
import { store } from '../../app/store';
import { Transport } from '../../constants';
import ClientPreferences from '../../lib/ClientPreferences';
import ConfigProvider from '../../lib/ConfigProvider';
import Logger from '../../lib/Logger';
import { selectRoomId } from '../../selectors/workspaceSelectors';
import AbstractNetworkController, { type Message } from '../AbstractNetworkController';
import type { Socket } from 'socket.io-client';


export const WEBSOCKET_ACTIONS = {
  USER_CONNECT: 'USER_CONNECT',
  USER_DISCONNECT: 'USER_DISCONNECT',
} as const;

interface UserConnectionMessage {
  userId: string
}

export default class WebsocketController extends AbstractNetworkController {
  private static instance?: WebsocketController;
  private socket?: Socket;

  public connect() {
    if (this.socket) {
      return;
    }
    
    this.socket = io(ConfigProvider.getServiceUrl(), {
      withCredentials: true, // Include cookies for authentication
      transports: ['websocket'], // Use only WebSocket transport to avoid the need for sticky sessions
      query: {
        displayName: ClientPreferences.getDisplayName(),
        roomId: selectRoomId(store)
      },
    });

    // setup queued event handlers
    for (const [eventType, callbacks] of this.messageHandlers.entries()) {
      callbacks.forEach(cb => this.socket!.on(eventType, cb));
    }
    this.messageHandlers = new Map(); // clear message handlers, socketio has got it from here

    this.on(WEBSOCKET_ACTIONS.USER_CONNECT, this.onUserConnect);
    this.on(WEBSOCKET_ACTIONS.USER_DISCONNECT, this.onUserDisconnect);
    this.on('AUTOMERGE_PROTOCOL', (message: unknown) => {
      Logger.INFO('[WebSocket] AUTOMERGE_PROTOCOL message received:', message);
    });
    this.on('exception', (error: Error & { code?: number }) => {
      if (error?.code === 429) {
        Logger.ERROR('You have exceeded websocket message limits, please slow down!');
        return;
      }
      Logger.ERROR('WebSocket error:', error?.message || error);
    });
  }

  public static getInstance(): WebsocketController {
    if (!WebsocketController.instance) {
      WebsocketController.instance = new WebsocketController();
    }

    return WebsocketController.instance;
  }

  on<T>(action: string, callback: (message: T) => void) {
    if (!this.socket) {
      // queue handler to be added on connection
      super.on(action, callback);
      return;
    }

    // Wrap callback to add logging for AUTOMERGE_PROTOCOL
    const wrappedCallback = action === 'AUTOMERGE_PROTOCOL' 
      ? (message: T) => {
          Logger.DEBUG(`[WebSocket] Received ${action}`, message);
          callback(message);
        }
      : callback;

    this.socket.on(action, wrappedCallback);
  }

  off<T>(action: string, callback: (message: T) => void) {
    if (!this.socket) {
      // prevent this handler being added on connection
      super.off(action, callback);
      return;
    }

    this.socket.off(action, callback);
  }

  public broadcast(action: string, payload?: Message): void {
    if (!this.socket || !this.socket.connected) {
      Logger.WARN('Cannot send message before websocket is connected');
      return;
    }

    this.socket.emit(action, payload);
  }

  public sendToPeer(peerId: string, action: string, payload?: Message): void {
    Logger.DEBUG(`[WebSocket] Sending ${action} to peer ${peerId}`, payload);
    this.broadcast(action, {
      ...payload,
      targetUserIds: [peerId],
    });
  }

  public sendToPeers(peerIds: string[], action: string, payload?: Message): void {
    this.broadcast(action, {
      ...payload,
      targetUserIds: peerIds,
    });
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private onUserConnect(message: UserConnectionMessage) {
    Logger.INFO('[WebSocket] onUserConnect called with userId:', message.userId);
    addPeerConnection(message.userId, Transport.WEBSOCKET, 0);
    Logger.INFO('[WebSocket] addPeerConnection completed for userId:', message.userId);
  }

  private onUserDisconnect(message: UserConnectionMessage) {
    removePeerConnection(message.userId);
  }

  static destroy(): void {
    WebsocketController.instance?.socket?.disconnect();
    WebsocketController.instance = undefined;
  }
}
