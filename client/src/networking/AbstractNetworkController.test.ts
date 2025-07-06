import { describe, it, expect, vi } from 'vitest';
import AbstractNetworkController, { type MessageHandler } from './AbstractNetworkController';

class TestNetworkController extends AbstractNetworkController {
  constructor() {
    super();
  }

  public getMessageHandlers() {
    return this.messageHandlers;
  }

  // Implement abstract methods for testing
  public broadcast(action: string, message: any) {
    super.broadcast(action, message);
  }

  public sendToPeer(peerId: string, action: string, message: any) {
    super.sendToPeer(peerId, action, message);
  }

  public sendToPeers(peerIds: string[], action: string, message: any) {
    super.sendToPeers(peerIds, action, message);
  }
}

describe('AbstractNetworkController', () => {
  let controller: TestNetworkController;

  beforeEach(() => {
    controller = new TestNetworkController();
  });

  describe('on', () => {
    it('should add event handler to new event type', () => {
      const handler = vi.fn();
      
      controller.on('test-event', handler);
      
      const handlers = controller.getMessageHandlers().get('test-event');
      expect(handlers).toBeDefined();
      expect(handlers?.has(handler)).toBe(true);
    });

    it('should add multiple handlers to same event type', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      controller.on('test-event', handler1);
      controller.on('test-event', handler2);
      
      const handlers = controller.getMessageHandlers().get('test-event');
      expect(handlers?.size).toBe(2);
      expect(handlers?.has(handler1)).toBe(true);
      expect(handlers?.has(handler2)).toBe(true);
    });
  });

  describe('once', () => {
    it('should add handler that removes itself after execution', () => {
      const handler = vi.fn();
      
      controller.once('test-event', handler);
      
      // Initially, the wrapper should be registered
      const handlers = controller.getMessageHandlers().get('test-event');
      expect(handlers?.size).toBe(1);
      
      // Simulate event trigger by calling the wrapper directly
      const wrapper = Array.from(handlers!)[0];
      wrapper({ type: 'test-event' });
      
      expect(handler).toHaveBeenCalledWith({ type: 'test-event' });
      expect(handlers?.size).toBe(0);
    });
  });

  describe('off', () => {
    it('should remove specific handler from event type', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      controller.on('test-event', handler1);
      controller.on('test-event', handler2);
      controller.off('test-event', handler1);
      
      const handlers = controller.getMessageHandlers().get('test-event');
      expect(handlers?.size).toBe(1);
      expect(handlers?.has(handler1)).toBe(false);
      expect(handlers?.has(handler2)).toBe(true);
    });

    it('should handle removing handler from non-existent event type', () => {
      const handler = vi.fn();
      
      expect(() => {
        controller.off('non-existent', handler);
      }).not.toThrow();
    });
  });

  describe('abstract methods', () => {
    it('should throw error for broadcast', () => {
      expect(() => {
        controller.broadcast('action', { data: 'test' });
      }).toThrow('Not implemented');
    });

    it('should throw error for sendToPeer', () => {
      expect(() => {
        controller.sendToPeer('peer-1', 'action', { data: 'test' });
      }).toThrow('Not implemented');
    });

    it('should throw error for sendToPeers', () => {
      expect(() => {
        controller.sendToPeers(['peer-1', 'peer-2'], 'action', { data: 'test' });
      }).toThrow('Not implemented');
    });
  });
});