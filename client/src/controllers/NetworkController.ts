export type Message = Record<string, any>;
export type MessageHandler<T extends Message = any> = (event: T) => void;

export default abstract class NetworkController {
  protected messageHandlers: Map<string, Set<MessageHandler>>;

  protected constructor() {
    this.messageHandlers = new Map();
  }
  
  public on<T extends MessageHandler>(eventType: string, handler: T) {
    if (!this.messageHandlers.get(eventType)) {
      this.messageHandlers.set(eventType, new Set())
    }

    this.messageHandlers.get(eventType)!.add(handler)
  }

  public off<T extends MessageHandler>(eventType: string, handler: T) {
    this.messageHandlers.get(eventType)?.delete(handler);
  }

  public broadcast(action: string, message: Message) {
    throw new Error('Not implemented');    
  }

  public sendToPeer(peerId: string, action: string, message: Message) {
    throw new Error('Not implemented');
  }
}