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

    this.socket.on(action, callback);
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
    if (!this.socket) {
      Logger.WARN('Cannot send message before websocket is connected');
      return;
    }

    this.socket.emit(action, payload);
  }

  public sendToPeer(peerId: string, action: string, payload?: Message): void {
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

  private onUserConnect(message: UserConnectionMessage) {
    addPeerConnection(message.userId, Transport.WEBSOCKET, 0);
  }

  private onUserDisconnect(message: UserConnectionMessage) {
    removePeerConnection(message.userId);
  }

  static destroy(): void {
    WebsocketController.instance?.socket?.disconnect();
    WebsocketController.instance = undefined;
  }
}
