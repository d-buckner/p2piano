/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: need to move to better types for messages in general
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Message<T = any> = Record<string, T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MessageHandler<T extends Message = any> = (event: T) => void;

export default abstract class AbstractNetworkController {
  protected messageHandlers: Map<string, Set<MessageHandler>>;

  protected constructor() {
    this.messageHandlers = new Map();
  }

  public on<T extends MessageHandler>(eventType: string, handler: T) {
    if (!this.messageHandlers.get(eventType)) {
      this.messageHandlers.set(eventType, new Set());
    }

    this.messageHandlers.get(eventType)!.add(handler);
  }

  public once<T extends MessageHandler>(eventType: string, handler: T) {
    const wrapper: MessageHandler = (event) => {
      handler(event);
      this.off(eventType, wrapper);
    };
    this.on(eventType, wrapper);
  }

  public off<T extends MessageHandler>(eventType: string, handler: T) {
    this.messageHandlers.get(eventType)?.delete(handler);
  }

  public broadcast(action: string, message?: Message) {
    throw new Error('Not implemented');    
  }

  public sendToPeer(peerId: string, action: string, message?: Message) {
    throw new Error('Not implemented');
  }

  public sendToPeers(peerIds: string[], action: string, message?: Message) {
    throw new Error('Not implemented');
  }
}
