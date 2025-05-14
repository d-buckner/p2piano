type Message = Map<string, any>;
type MessageHandler = (event: Message) => void;

export default abstract class NetworkController {
  protected messageHandlers: Map<string, Set<MessageHandler>>;

  protected constructor() {
    this.messageHandlers = new Map();
  }
  
  public on(eventType: string, handler: MessageHandler) {
    if (!this.messageHandlers.get(eventType)) {
      this.messageHandlers.set(eventType, new Set())
    }

    this.messageHandlers.get(eventType)!.add(handler)
  }

  public off(eventType: string, handler: MessageHandler) {
    this.messageHandlers.get(eventType)?.delete(handler);
  }

  public broadcast(action: string, message: Message) {
    throw new Error('Not implemented');    
  }

  public sendToPeer(peerId: string, action: string, message: Message) {
    throw new Error('Not implemented');
  }
}