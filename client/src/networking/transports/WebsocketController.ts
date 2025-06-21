import { io } from 'socket.io-client';
import AbstractNetworkController from "../AbstractNetworkController";
import ClientPreferences from '../../lib/ClientPreferences';
import ConfigProvider from '../../lib/ConfigProvider';
import Session from '../../lib/Session';
import { getWorkspace } from '../../lib/WorkspaceHelper';
import { Transport, type Payload } from '../../constants';
import { connectionActions } from '../../slices/connectionSlice';
import { dispatch } from '../../app/store';
import Logger from '../../lib/Logger';

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
  private socket: Socket;

  private constructor() {
    super();
    this.socket = io(ConfigProvider.getServiceUrl(), {
      query: {
        displayName: ClientPreferences.getDisplayName(),
        sessionId: Session.getSessionId(),
        roomId: getWorkspace().roomId
      },
    });
    this.on(WEBSOCKET_ACTIONS.USER_CONNECT, this.onUserConnect);
    this.on(WEBSOCKET_ACTIONS.USER_DISCONNECT, this.onUserDisconnect);
    this.on('exception', () => Logger.ERROR('You have exceeded websocket message limits, please slow down!'));
  }

  public static getInstance(): WebsocketController {
    if (!WebsocketController.instance) {
      WebsocketController.instance = new WebsocketController();
    }

    return WebsocketController.instance;
  }

  on<T>(action: string, callback: (message: T) => void) {
    this.socket.on(action, callback);
  }

  off<T>(action: string, callback: (message: T) => void) {
    this.socket.off(action, callback);
  }

  public broadcast(action: string, payload?: Payload): void {
    this.socket.emit(action, payload);
  }

  public sendToPeer(peerId: string, action: string, payload?: Payload): void {
    this.broadcast(action, {
      ...payload,
      targetUserIds: [peerId],
    });
  }

  public sendToPeers(peerIds: string[], action: string, payload?: Payload): void {
    this.broadcast(action, {
      ...payload,
      targetUserIds: peerIds,
    });
  }

  private onUserConnect(message: UserConnectionMessage) {
    dispatch(connectionActions.addPeerConnection({
      peerId: message.userId,
      transport: Transport.WEBSOCKET,
    }));
  }

  private onUserDisconnect(message: UserConnectionMessage) {
    dispatch(connectionActions.removePeerConnection(message.userId));
  }

  static destroy(): void {
    WebsocketController.instance?.socket.disconnect();
    WebsocketController.instance = undefined;
  }
}
