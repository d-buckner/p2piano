import { describe, it, expect, vi } from 'vitest';
import { ServiceState, createServiceState } from './ServiceState';


interface TestState {
  count: number;
  name: string;
  isActive: boolean;
  items: string[];
}

describe('ServiceState', () => {
  it('should initialize with initial state', () => {
    const state = new ServiceState<TestState>({
      count: 0,
      name: 'test',
      isActive: false,
      items: []
    });
    
    expect(state.getState('count')).toBe(0);
    expect(state.getState('name')).toBe('test');
    expect(state.getState('isActive')).toBe(false);
    expect(state.getState('items')).toEqual([]);
  });
  
  it('should emit events when state is set', () => {
    const state = new ServiceState<TestState>({
      count: 0,
      name: 'test',
      isActive: false,
      items: []
    });
    
    const listener = vi.fn();
    state.events.on('count', listener);
    
    state.setState('count', 5);
    expect(listener).toHaveBeenCalledWith(5);
    expect(state.getState('count')).toBe(5);
  });
  
  it('should emit events for initial state', () => {
    const listener = vi.fn();
    
    const state = new ServiceState<TestState>({
      count: 42,
      name: 'initial',
      isActive: true,
      items: ['a', 'b']
    });
    
    state.events.on('count', listener);
    // Should already have the initial value available
    expect(state.events.getCurrentValue('count')).toBe(42);
  });
  
  it('should set multiple states at once', () => {
    const state = new ServiceState<TestState>({
      count: 0,
      name: 'test',
      isActive: false,
      items: []
    });
    
    const countListener = vi.fn();
    const nameListener = vi.fn();
    
    state.events.on('count', countListener);
    state.events.on('name', nameListener);
    
    state.setStates({
      count: 10,
      name: 'updated'
    });
    
    expect(countListener).toHaveBeenCalledWith(10);
    expect(nameListener).toHaveBeenCalledWith('updated');
    expect(state.getState('count')).toBe(10);
    expect(state.getState('name')).toBe('updated');
  });
  
  it('should return all state', () => {
    const initialState = {
      count: 5,
      name: 'test',
      isActive: true,
      items: ['x', 'y']
    };
    
    const state = new ServiceState(initialState);
    expect(state.getAllState()).toEqual(initialState);
  });
});

describe('createServiceState (Proxy)', () => {
  it('should allow property-based access to state', () => {
    const state = createServiceState({
      count: 0,
      name: 'test',
      isActive: false
    });
    
    expect(state.count).toBe(0);
    expect(state.name).toBe('test');
    expect(state.isActive).toBe(false);
  });
  
  it('should allow property-based setting with auto-emit', () => {
    const state = createServiceState({
      count: 0,
      name: 'test'
    });
    
    const listener = vi.fn();
    state.events.on('count', listener);
    
    state.count = 42;
    
    expect(state.count).toBe(42);
    expect(listener).toHaveBeenCalledWith(42);
  });
  
  it('should expose events and methods', () => {
    const state = createServiceState({
      count: 0,
      name: 'test'
    });
    
    expect(state.events).toBeDefined();
    expect(typeof state.setState).toBe('function');
    expect(typeof state.setStates).toBe('function');
  });
  
  it('should work with setState method', () => {
    const state = createServiceState({
      count: 0,
      name: 'test'
    });
    
    const listener = vi.fn();
    state.events.on('name', listener);
    
    state.setState('name', 'updated');
    
    expect(state.name).toBe('updated');
    expect(listener).toHaveBeenCalledWith('updated');
  });
  
  it('should work with setStates method', () => {
    const state = createServiceState({
      count: 0,
      name: 'test',
      isActive: false
    });
    
    const countListener = vi.fn();
    const nameListener = vi.fn();
    
    state.events.on('count', countListener);
    state.events.on('name', nameListener);
    
    state.setStates({
      count: 100,
      name: 'batch-updated'
    });
    
    expect(state.count).toBe(100);
    expect(state.name).toBe('batch-updated');
    expect(countListener).toHaveBeenCalledWith(100);
    expect(nameListener).toHaveBeenCalledWith('batch-updated');
  });
  
  it('should support property enumeration', () => {
    const state = createServiceState({
      count: 5,
      name: 'test',
      isActive: true
    });
    
    const keys = Object.keys(state);
    expect(keys).toContain('count');
    expect(keys).toContain('name'); 
    expect(keys).toContain('isActive');
    expect(keys).toContain('events');
  });
});
