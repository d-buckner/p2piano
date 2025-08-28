import { describe, it, expect, vi } from 'vitest';
import { Service } from './Service';


interface TestServiceState {
  count: number;
  message: string;
  isActive: boolean;
}

class TestService extends Service<TestServiceState> {
  constructor() {
    super({
      count: 0,
      message: 'hello',
      isActive: false
    });
  }

  public increment(): void {
    this.setState('count', this.getState('count') + 1);
  }

  public updateMessage(message: string): void {
    this.setState('message', message);
  }

  public toggle(): void {
    this.setState('isActive', !this.getState('isActive'));
  }

  public bulkUpdate(updates: Partial<TestServiceState>): void {
    this.setStates(updates);
  }

  // Expose protected methods for testing
  public getStateForTest<K extends keyof TestServiceState>(key: K): TestServiceState[K] {
    return this.getState(key);
  }

  public getAllStateForTest(): TestServiceState {
    return this.getAllState();
  }
}

describe('Service', () => {
  it('should initialize with initial state', () => {
    const service = new TestService();
    
    expect(service.events.getCurrentValue('count')).toBe(0);
    expect(service.events.getCurrentValue('message')).toBe('hello');
    expect(service.events.getCurrentValue('isActive')).toBe(false);
  });

  it('should emit events when state changes', () => {
    const service = new TestService();
    const countListener = vi.fn();
    const messageListener = vi.fn();

    service.events.on('count', countListener);
    service.events.on('message', messageListener);

    service.increment();
    service.updateMessage('world');

    expect(countListener).toHaveBeenCalledWith(1);
    expect(messageListener).toHaveBeenCalledWith('world');
  });

  it('should update current state values', () => {
    const service = new TestService();

    service.increment();
    service.updateMessage('updated');
    service.toggle();

    expect(service.events.getCurrentValue('count')).toBe(1);
    expect(service.events.getCurrentValue('message')).toBe('updated');
    expect(service.events.getCurrentValue('isActive')).toBe(true);
  });

  it('should support bulk state updates', () => {
    const service = new TestService();
    const countListener = vi.fn();
    const messageListener = vi.fn();
    const activeListener = vi.fn();

    service.events.on('count', countListener);
    service.events.on('message', messageListener);
    service.events.on('isActive', activeListener);

    service.bulkUpdate({
      count: 10,
      message: 'bulk update',
      isActive: true
    });

    expect(countListener).toHaveBeenCalledWith(10);
    expect(messageListener).toHaveBeenCalledWith('bulk update');
    expect(activeListener).toHaveBeenCalledWith(true);
    
    expect(service.events.getCurrentValue('count')).toBe(10);
    expect(service.events.getCurrentValue('message')).toBe('bulk update');
    expect(service.events.getCurrentValue('isActive')).toBe(true);
  });

  it('should provide access to protected state methods', () => {
    const service = new TestService();

    expect(service.getStateForTest('count')).toBe(0);
    expect(service.getAllStateForTest()).toEqual({
      count: 0,
      message: 'hello',
      isActive: false
    });
  });

  it('should clear events and state for testing', () => {
    const service = new TestService();
    const listener = vi.fn();

    service.events.on('count', listener);
    service.increment();

    expect(service.events.getCurrentValue('count')).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);

    service.clear();

    expect(service.events.getCurrentState()).toEqual({});
    
    service.increment(); // This should still work and emit
    expect(listener).toHaveBeenCalledTimes(1); // Listener was cleared
    expect(service.events.getCurrentValue('count')).toBe(2); // State is updated
  });

  it('should be type-safe', () => {
    const service = new TestService();

    // These should compile without errors and provide proper types
    service.events.on('count', (count) => {
      expect(typeof count).toBe('number');
    });

    service.events.on('message', (message) => {
      expect(typeof message).toBe('string');
    });

    service.events.on('isActive', (active) => {
      expect(typeof active).toBe('boolean');
    });
  });

  it('should support reactive subscriptions', () => {
    const service = new TestService();
    const values: number[] = [];

    service.events.on('count', (count) => {
      values.push(count);
    });

    service.increment(); // 1
    service.increment(); // 2
    service.increment(); // 3

    expect(values).toEqual([1, 2, 3]);
  });
});
