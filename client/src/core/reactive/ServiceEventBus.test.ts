import { describe, it, expect, vi } from 'vitest';
import { ServiceEventBus } from './ServiceEventBus';


interface TestEvents {
  userConnected: { userId: string; timestamp: number };
  messageReceived: { message: string; from: string };
  statusChanged: 'online' | 'offline' | 'busy';
}

describe('ServiceEventBus', () => {
  it('should emit events and call listeners', () => {
    const bus = new ServiceEventBus<TestEvents>();
    const listener = vi.fn();
    
    bus.on('userConnected', listener);
    bus.emit('userConnected', { userId: '123', timestamp: Date.now() });
    
    expect(listener).toHaveBeenCalledWith({ userId: '123', timestamp: expect.any(Number) });
  });
  
  it('should store and retrieve current values', () => {
    const bus = new ServiceEventBus<TestEvents>();
    
    bus.emit('statusChanged', 'online');
    expect(bus.getCurrentValue('statusChanged')).toBe('online');
    
    bus.emit('statusChanged', 'offline');
    expect(bus.getCurrentValue('statusChanged')).toBe('offline');
  });
  
  it('should return undefined for unset values', () => {
    const bus = new ServiceEventBus<TestEvents>();
    
    expect(bus.getCurrentValue('statusChanged')).toBeUndefined();
  });
  
  it('should support multiple listeners for same event', () => {
    const bus = new ServiceEventBus<TestEvents>();
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    
    bus.on('statusChanged', listener1);
    bus.on('statusChanged', listener2);
    
    bus.emit('statusChanged', 'busy');
    
    expect(listener1).toHaveBeenCalledWith('busy');
    expect(listener2).toHaveBeenCalledWith('busy');
  });
  
  it('should remove listeners when cleanup function is called', () => {
    const bus = new ServiceEventBus<TestEvents>();
    const listener = vi.fn();
    
    const cleanup = bus.on('statusChanged', listener);
    bus.emit('statusChanged', 'online');
    expect(listener).toHaveBeenCalledTimes(1);
    
    cleanup();
    bus.emit('statusChanged', 'offline');
    expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
  });
  
  it('should return all current state', () => {
    const bus = new ServiceEventBus<TestEvents>();
    
    bus.emit('statusChanged', 'online');
    bus.emit('userConnected', { userId: 'user1', timestamp: 12345 });
    
    const state = bus.getCurrentState();
    expect(state).toEqual({
      statusChanged: 'online',
      userConnected: { userId: 'user1', timestamp: 12345 }
    });
  });
  
  it('should clear all listeners and state', () => {
    const bus = new ServiceEventBus<TestEvents>();
    const listener = vi.fn();
    
    bus.on('statusChanged', listener);
    bus.emit('statusChanged', 'online');
    expect(bus.getCurrentValue('statusChanged')).toBe('online');
    
    bus.clear();
    expect(bus.getCurrentState()).toEqual({});
    
    bus.emit('statusChanged', 'offline');
    expect(listener).toHaveBeenCalledTimes(1); // Only the first emit, listener was cleared
    expect(bus.getCurrentValue('statusChanged')).toBe('offline'); // But state is updated by emit
  });
  
  it('should be type-safe', () => {
    const bus = new ServiceEventBus<TestEvents>();
    
    // These should compile without errors
    bus.on('statusChanged', (status) => {
      // TypeScript knows status is 'online' | 'offline' | 'busy'
      expect(typeof status).toBe('string');
    });
    
    bus.on('userConnected', (data) => {
      // TypeScript knows data has userId and timestamp
      expect(typeof data.userId).toBe('string');
      expect(typeof data.timestamp).toBe('number');
    });
  });
});
