import { io } from 'socket.io-client';
import ClientPreferences from '../lib/ClientPreferences';
import ConfigProvider from '../lib/ConfigProvider';
import Session from '../lib/Session';
import { getWorkspace } from '../lib/WorkspaceHelper';

import type { Payload } from '../constants';
import type { Socket } from 'socket.io-client';

export type WebsocketMessage = {
  action: string;
  payload?: Payload;
};


export default class WebsocketController {
  private static instance?: WebsocketController;
  private socket: Socket;

  private constructor() {
    this.socket = io(ConfigProvider.getServiceUrl(), {
      query: {
        displayName: ClientPreferences.getDisplayName(),
        sessionId: Session.getSessionId(),
        roomId: getWorkspace().roomId
      },
    });
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

  send(action: string, payload?: Payload): void {
    this.socket.emit(action, payload);
  }

  static destroy(): void {
    WebsocketController.instance?.socket.disconnect();
    WebsocketController.instance = undefined;
  }
}
