import { describe, it, expect, vi } from 'vitest';
import SessionRegistry from './SessionRegistry';
import type { Socket } from 'socket.io';


describe('SessionRegistry', () => {
  const mockSocket = {
    id: 'socket-id',
    emit: vi.fn(),
  } as unknown as Socket;

  const mockSocket2 = {
    id: 'socket-id-2', 
    emit: vi.fn(),
  } as unknown as Socket;

  describe('registerSession', () => {
    it('should register a session with socket', () => {
      SessionRegistry.registerSession('session-1', mockSocket);
      
      const retrievedSocket = SessionRegistry.getSocket('session-1');
      expect(retrievedSocket).toBe(mockSocket);
    });

    it('should overwrite existing session', () => {
      SessionRegistry.registerSession('session-1', mockSocket);
      SessionRegistry.registerSession('session-1', mockSocket2);
      
      const retrievedSocket = SessionRegistry.getSocket('session-1');
      expect(retrievedSocket).toBe(mockSocket2);
    });
  });

  describe('getSocket', () => {
    it('should return socket for existing session', () => {
      SessionRegistry.registerSession('session-2', mockSocket);
      
      const result = SessionRegistry.getSocket('session-2');
      expect(result).toBe(mockSocket);
    });

    it('should return undefined for non-existent session', () => {
      const result = SessionRegistry.getSocket('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('destroySession', () => {
    it('should remove session from registry', () => {
      SessionRegistry.registerSession('session-3', mockSocket);
      expect(SessionRegistry.getSocket('session-3')).toBe(mockSocket);
      
      SessionRegistry.destroySession('session-3');
      expect(SessionRegistry.getSocket('session-3')).toBeUndefined();
    });

    it('should handle destroying non-existent session', () => {
      expect(() => {
        SessionRegistry.destroySession('non-existent');
      }).not.toThrow();
    });
  });
});
