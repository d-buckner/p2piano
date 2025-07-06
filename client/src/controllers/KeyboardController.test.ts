import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import KeyboardController from './KeyboardController';

// Mock window and document
const mockAddEventListener: ReturnType<typeof vi.fn> = vi.fn();
const mockRemoveEventListener: ReturnType<typeof vi.fn> = vi.fn();
const mockDocumentAddEventListener: ReturnType<typeof vi.fn> = vi.fn();
const mockDocumentRemoveEventListener: ReturnType<typeof vi.fn> = vi.fn();

// Store original implementations
const originalWindow = global.window;
const originalDocument = global.document;

describe('KeyboardController', () => {
  let controller: KeyboardController;
  let keyDownHandler: ReturnType<typeof vi.fn>;
  let keyUpHandler: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    (KeyboardController as { instance: undefined }).instance = undefined;
    
    vi.stubGlobal('window', {
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    vi.stubGlobal('document', {
      addEventListener: mockDocumentAddEventListener,
      removeEventListener: mockDocumentRemoveEventListener,
      hidden: false,
      activeElement: null,
    });

    keyDownHandler = vi.fn();
    keyUpHandler = vi.fn();
  });

  afterEach(() => {
    try {
      controller?.destroy();
    } catch {
      // Ignore cleanup errors
    }
    
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('singleton behavior', () => {
    it('should return the same instance', () => {
      const instance1 = KeyboardController.getInstance();
      const instance2 = KeyboardController.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should set up event listeners on construction', () => {
      controller = KeyboardController.getInstance();
      
      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(mockDocumentAddEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });
  });

  describe('handler registration', () => {
    beforeEach(() => {
      controller = KeyboardController.getInstance();
    });

    it('should register key down handler', () => {
      controller.registerKeyDownHandler(keyDownHandler);
      
      expect(() => controller.registerKeyDownHandler(keyDownHandler)).not.toThrow();
    });

    it('should register key up handler', () => {
      controller.registerKeyUpHandler(keyUpHandler);
      
      expect(() => controller.registerKeyUpHandler(keyUpHandler)).not.toThrow();
    });
  });

  describe('key mapping', () => {
    beforeEach(() => {
      controller = KeyboardController.getInstance();
      controller.registerKeyDownHandler(keyDownHandler);
      controller.registerKeyUpHandler(keyUpHandler);
    });

    it('should map lowercase letters to correct MIDI notes', () => {
      const testCases = [
        { key: 'a', expectedMidi: 60 },
        { key: 'w', expectedMidi: 61 },
        { key: 's', expectedMidi: 62 },
        { key: 'd', expectedMidi: 64 },
      ];

      testCases.forEach(({ key, expectedMidi }) => {
        const event = {
          key,
          metaKey: false,
          shiftKey: false,
          altKey: false,
          preventDefault: vi.fn(),
        };
        
        const keydownHandler = mockAddEventListener.mock.calls.find(
          call => call[0] === 'keydown'
        )?.[1];
        
        keydownHandler?.(event);
        
        expect(keyDownHandler).toHaveBeenCalledWith(expectedMidi);
        keyDownHandler.mockClear();
      });
    });

    it('should map uppercase letters to same MIDI notes as lowercase', () => {
      const testCases = [
        { key: 'A', expectedMidi: 60 },
        { key: 'W', expectedMidi: 61 },
        { key: 'S', expectedMidi: 62 },
      ];

      testCases.forEach(({ key, expectedMidi }) => {
        const event = new KeyboardEvent('keydown', { key });
        
        const keydownHandler = mockAddEventListener.mock.calls.find(
          call => call[0] === 'keydown'
        )?.[1];
        
        keydownHandler?.(event);
        
        expect(keyDownHandler).toHaveBeenCalledWith(expectedMidi);
        keyDownHandler.mockClear();
      });
    });

    it('should handle special characters', () => {
      Object.defineProperty(document, 'activeElement', {
        value: { tagName: 'DIV' },
        writable: true,
      });

      // Test just semicolon first to debug
      const event = {
        key: ';',
        metaKey: false,
        shiftKey: false,
        altKey: false,
        preventDefault: vi.fn(),
      };
      
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];
      
      keydownHandler?.(event);
      
      expect(keyDownHandler).toHaveBeenCalledWith(76);
    });

    it('should handle apostrophe character', () => {
      Object.defineProperty(document, 'activeElement', {
        value: { tagName: 'DIV' },
        writable: true,
      });

      const event = {
        key: "'",
        metaKey: false,
        shiftKey: false,
        altKey: false,
        preventDefault: vi.fn(),
      };
      
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];
      
      keydownHandler?.(event);
      
      expect(keyDownHandler).toHaveBeenCalledWith(77);
    });
  });

  describe('key press handling', () => {
    beforeEach(() => {
      controller = KeyboardController.getInstance();
      controller.registerKeyDownHandler(keyDownHandler);
      controller.registerKeyUpHandler(keyUpHandler);
    });

    it('should prevent default behavior for mapped keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];
      
      keydownHandler?.(event);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should ignore unmapped keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'x' });
      
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];
      
      keydownHandler?.(event);
      
      expect(keyDownHandler).not.toHaveBeenCalled();
    });

    it('should ignore keys with modifiers', () => {
      const testCases = [
        { key: 'a', metaKey: true },
        { key: 'a', shiftKey: true },
        { key: 'a', altKey: true },
      ];

      testCases.forEach((eventInit) => {
        const event = new KeyboardEvent('keydown', eventInit);
        
        const keydownHandler = mockAddEventListener.mock.calls.find(
          call => call[0] === 'keydown'
        )?.[1];
        
        keydownHandler?.(event);
        
        expect(keyDownHandler).not.toHaveBeenCalled();
      });
    });

    it('should ignore keys when select element is active', () => {
      Object.defineProperty(document, 'activeElement', {
        value: { tagName: 'SELECT' },
        writable: true,
      });

      const event = new KeyboardEvent('keydown', { key: 'a' });
      
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];
      
      keydownHandler?.(event);
      
      expect(keyDownHandler).not.toHaveBeenCalled();
    });

    it('should prevent key repeat for same MIDI note', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];
      
      keydownHandler?.(event);
      expect(keyDownHandler).toHaveBeenCalledTimes(1);
      
      keydownHandler?.(event);
      expect(keyDownHandler).toHaveBeenCalledTimes(1); // Should not increase
    });

    it('should do nothing when no handler is registered', () => {
      controller = KeyboardController.getInstance();
      
      const event = new KeyboardEvent('keydown', { key: 'a' });
      
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];
      
      expect(() => keydownHandler?.(event)).not.toThrow();
    });
  });

  describe('key release handling', () => {
    beforeEach(() => {
      controller = KeyboardController.getInstance();
      controller.registerKeyDownHandler(keyDownHandler);
      controller.registerKeyUpHandler(keyUpHandler);
    });

    it('should call key up handler for mapped keys', () => {
      const event = new KeyboardEvent('keyup', { key: 'a' });
      
      const keyupHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keyup'
      )?.[1];
      
      keyupHandler?.(event);
      
      expect(keyUpHandler).toHaveBeenCalledWith(60);
    });

    it('should ignore unmapped keys on release', () => {
      const event = new KeyboardEvent('keyup', { key: 'x' });
      
      const keyupHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keyup'
      )?.[1];
      
      keyupHandler?.(event);
      
      expect(keyUpHandler).not.toHaveBeenCalled();
    });

    it('should do nothing when no handler is registered', () => {
      controller = KeyboardController.getInstance();
      
      const event = new KeyboardEvent('keyup', { key: 'a' });
      
      const keyupHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keyup'
      )?.[1];
      
      expect(() => keyupHandler?.(event)).not.toThrow();
    });
  });

  describe('visibility change handling', () => {
    beforeEach(() => {
      controller = KeyboardController.getInstance();
      controller.registerKeyDownHandler(keyDownHandler);
      controller.registerKeyUpHandler(keyUpHandler);
    });

    it('should release all active keys when page becomes hidden', () => {
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];
      
      keydownHandler?.(new KeyboardEvent('keydown', { key: 'a' }));
      keydownHandler?.(new KeyboardEvent('keydown', { key: 's' }));
      
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true,
      });
      
      const visibilityHandler = mockDocumentAddEventListener.mock.calls.find(
        call => call[0] === 'visibilitychange'
      )?.[1];
      
      visibilityHandler?.();
      
      expect(keyUpHandler).toHaveBeenCalledWith(60); // 'a'
      expect(keyUpHandler).toHaveBeenCalledWith(62); // 's'
    });

    it('should not release keys when page becomes visible', () => {
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: true,
      });
      
      const visibilityHandler = mockDocumentAddEventListener.mock.calls.find(
        call => call[0] === 'visibilitychange'
      )?.[1];
      
      visibilityHandler?.();
      
      expect(keyUpHandler).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    beforeEach(() => {
      controller = KeyboardController.getInstance();
    });

    it('should remove all event listeners', () => {
      controller.destroy();
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(mockDocumentRemoveEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });

    it('should reset singleton instance', () => {
      const instance1 = controller;
      controller.destroy();
      const instance2 = KeyboardController.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      controller = KeyboardController.getInstance();
      controller.registerKeyDownHandler(keyDownHandler);
      controller.registerKeyUpHandler(keyUpHandler);
    });

    it('should handle full key press cycle', () => {
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];
      const keyupHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keyup'
      )?.[1];
      
      keydownHandler?.(new KeyboardEvent('keydown', { key: 'a' }));
      expect(keyDownHandler).toHaveBeenCalledWith(60);
      
      keyupHandler?.(new KeyboardEvent('keyup', { key: 'a' }));
      expect(keyUpHandler).toHaveBeenCalledWith(60);
      
      keydownHandler?.(new KeyboardEvent('keydown', { key: 'a' }));
      expect(keyDownHandler).toHaveBeenCalledTimes(2);
    });
  });
});