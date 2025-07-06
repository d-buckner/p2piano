import { describe, it, expect } from 'vitest';
import { AppController } from './app.controller';


describe('AppController Basic', () => {
  it('should be defined', () => {
    expect(AppController).toBeDefined();
  });

  it('should have constructor', () => {
    expect(AppController.prototype.constructor).toBeDefined();
  });

  it('should have createRoom method', () => {
    expect(AppController.prototype.createRoom).toBeDefined();
    expect(typeof AppController.prototype.createRoom).toBe('function');
  });

  it('should have getRoom method', () => {
    expect(AppController.prototype.getRoom).toBeDefined();
    expect(typeof AppController.prototype.getRoom).toBe('function');
  });
});
