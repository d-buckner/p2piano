import { Transport } from "../constants";
import { getConnectedPeerIds, getPeerConnection } from "../lib/ConnectionUtils";
import Logger from "../lib/Logger";
import AbstractNetworkController, {
  Message,
  MessageHandler,
} from "./AbstractNetworkController";
import WebRtcController from "./transports/WebRtcController";
import WebsocketController from "./transports/WebsocketController";

export default class RealTimeController extends AbstractNetworkController {
  private static instance?: RealTimeController;
  private websocketController: WebsocketController;
  private webrtcController: WebRtcController;

  private constructor() {
    super();
    this.websocketController = WebsocketController.getInstance();
    this.webrtcController = WebRtcController.getInstance();
  }

  public static getInstance(): RealTimeController {
    if (!RealTimeController.instance) {
      RealTimeController.instance = new RealTimeController();
    }

    return RealTimeController.instance;
  }

  public on<T extends MessageHandler>(eventType: string, handler: T) {
    this.webrtcController.on(eventType, handler);
    this.websocketController.on(eventType, handler);
  }

  public off<T extends MessageHandler>(eventType: string, handler: T) {
    this.webrtcController.off(eventType, handler);
    this.websocketController.off(eventType, handler);
  }

  public broadcast<T extends Message>(action: string, message: T) {
    const websocketPeerIds: string[] = [];

    getConnectedPeerIds().forEach((peerId: string) => {
      this.sendWithFallback(peerId, action, message, () => {
        websocketPeerIds.push(peerId);
      });
    });

    this.websocketController.sendToPeers(websocketPeerIds, action, message);
  }

  public sendToPeer<T extends Message>(
    peerId: string,
    action: string,
    message: T,
  ) {
    this.sendWithFallback(peerId, action, message, () => {
      this.websocketController.sendToPeer(peerId, action, message);
    });
  }

  public sendToPeers<T extends Message>(
    peerIds: string[],
    action: string,
    message: T,
  ) {
    const websocketPeerIds: string[] = [];

    peerIds.forEach((peerId: string) => {
      this.sendWithFallback(peerId, action, message, () => {
        websocketPeerIds.push(peerId);
      });
    });

    this.websocketController.sendToPeers(websocketPeerIds, action, message);
  }

  private sendWithFallback<T extends Message>(
    peerId: string,
    action: string,
    message: T,
    fallback: () => void,
  ) {
    if (getPeerConnection(peerId).transport === Transport.WEBRTC) {
      try {
        this.webrtcController.sendToPeer(peerId, action, message);
        return;
      } catch {
        // swallow to move to fallback
        Logger.WARN("webrtc message failed to send. invoking fallback");
      }
    }

    fallback();
  }

  static destroy() {
    RealTimeController.instance = undefined;
  }
}
