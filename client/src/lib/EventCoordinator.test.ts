import HuMIDI from 'humidi';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as NoteActions from '../actions/NoteActions';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import AudioSyncCoordinator from '../audio/syncronization/AudioSyncCoordinator';
import RoomHandlers from '../handlers/RoomHandlers';
import { register, destroy } from './EventCoordinator';

// Mock all dependencies
vi.mock('humidi', () => ({
  default: {
    on: vi.fn(),
    reset: vi.fn(),
  },
}));

vi.mock('../actions/NoteActions', () => ({
  keyDown: vi.fn(),
  keyUp: vi.fn(),
}));

vi.mock('../audio/instruments/InstrumentRegistry', () => ({
  default: {
    empty: vi.fn(),
  },
}));

vi.mock('../audio/syncronization/AudioSyncCoordinator', () => ({
  default: {
    start: vi.fn(),
    stop: vi.fn(),
  },
}));

vi.mock('../controllers/KeyboardController', () => ({
  default: {
    getInstance: vi.fn(() => mockKeyboardController),
  },
}));

vi.mock('../handlers/RoomHandlers', () => ({
  default: {
    keyDownHandler: vi.fn(),
    keyUpHandler: vi.fn(),
    roomJoinHandler: vi.fn(),
    userConnectHandler: vi.fn(),
    userDisconnectHandler: vi.fn(),
    userUpdateHandler: vi.fn(),
    roomDisconnectHandler: vi.fn(),
    blurHandler: vi.fn(),
  },
}));

vi.mock('../networking/RealTimeController', () => ({
  default: {
    getInstance: vi.fn(() => mockRealTimeController),
  },
}));

vi.mock('../networking/transports/WebsocketController', () => ({
  default: {
    getInstance: vi.fn(() => mockWebsocketController),
  },
}));

// Mock controller instances
const mockKeyboardController = {
  registerKeyDownHandler: vi.fn(),
  registerKeyUpHandler: vi.fn(),
  destroy: vi.fn(),
};

const mockRealTimeController = {
  on: vi.fn(),
};

const mockWebsocketController = {
  on: vi.fn(),
};

describe('EventCoordinator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset event listeners
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
  });

  describe('register', () => {
    it('should register MIDI handlers', () => {
      register();

      expect(HuMIDI.on).toHaveBeenCalledWith('noteon', RoomHandlers.keyDownHandler);
      expect(HuMIDI.on).toHaveBeenCalledWith('noteoff', RoomHandlers.keyUpHandler);
    });

    it('should register RTC handlers', () => {
      register();

      expect(mockRealTimeController.on).toHaveBeenCalledWith('KEY_DOWN', RoomHandlers.keyDownHandler);
      expect(mockRealTimeController.on).toHaveBeenCalledWith('KEY_UP', RoomHandlers.keyUpHandler);
    });

    it('should register WebSocket handlers', () => {
      register();

      expect(mockWebsocketController.on).toHaveBeenCalledWith('ROOM_JOIN', RoomHandlers.roomJoinHandler);
      expect(mockWebsocketController.on).toHaveBeenCalledWith('USER_CONNECT', RoomHandlers.userConnectHandler);
      expect(mockWebsocketController.on).toHaveBeenCalledWith('USER_DISCONNECT', RoomHandlers.userDisconnectHandler);
      expect(mockWebsocketController.on).toHaveBeenCalledWith('USER_UPDATE', RoomHandlers.userUpdateHandler);
      expect(mockWebsocketController.on).toHaveBeenCalledWith('disconnect', RoomHandlers.roomDisconnectHandler);
    });

    it('should register window blur handler', () => {
      register();

      expect(window.addEventListener).toHaveBeenCalledWith('blur', RoomHandlers.blurHandler);
    });

    it('should register keyboard handlers', () => {
      register();

      expect(mockKeyboardController.registerKeyDownHandler).toHaveBeenCalledWith(NoteActions.keyDown);
      expect(mockKeyboardController.registerKeyUpHandler).toHaveBeenCalledWith(NoteActions.keyUp);
    });

    it('should start audio sync coordinator', () => {
      register();

      expect(AudioSyncCoordinator.start).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should reset HuMIDI', () => {
      destroy();

      expect(HuMIDI.reset).toHaveBeenCalled();
    });

    it('should empty instrument registry', () => {
      destroy();

      expect(InstrumentRegistry.empty).toHaveBeenCalled();
    });

    it('should destroy keyboard controller', () => {
      destroy();

      expect(mockKeyboardController.destroy).toHaveBeenCalled();
    });

    it('should stop audio sync coordinator', () => {
      destroy();

      expect(AudioSyncCoordinator.stop).toHaveBeenCalled();
    });

    it('should remove window blur handler', () => {
      destroy();

      expect(window.removeEventListener).toHaveBeenCalledWith('blur', RoomHandlers.blurHandler);
    });
  });

  describe('integration behavior', () => {
    it('should handle complete setup and teardown cycle', () => {
      // Setup
      register();

      // Verify all components are initialized
      expect(mockKeyboardController.registerKeyDownHandler).toHaveBeenCalled();
      expect(mockWebsocketController.on).toHaveBeenCalled();
      expect(window.addEventListener).toHaveBeenCalled();

      // Teardown
      destroy();

      // Verify all components are cleaned up
      expect(mockKeyboardController.destroy).toHaveBeenCalled();
      expect(window.removeEventListener).toHaveBeenCalled();
    });

    it('should register all handler types correctly', () => {
      register();

      // MIDI handlers
      expect(mockRealTimeController.on).toHaveBeenCalledTimes(2);
      
      // WebSocket handlers  
      expect(mockWebsocketController.on).toHaveBeenCalledTimes(5);

      // Window event handlers
      expect(window.addEventListener).toHaveBeenCalledTimes(1);

      // Keyboard handlers
      expect(mockKeyboardController.registerKeyDownHandler).toHaveBeenCalledTimes(1);
      expect(mockKeyboardController.registerKeyUpHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('handler mapping', () => {
    it('should map MIDI events to correct handlers', () => {
      register();

      // Verify MIDI note events map to room handlers
      const midiCalls = vi.mocked(HuMIDI.on).mock.calls;
      expect(midiCalls.find((call) => call[0] === 'noteon')?.[1]).toBe(RoomHandlers.keyDownHandler);
      expect(midiCalls.find((call) => call[0] === 'noteoff')?.[1]).toBe(RoomHandlers.keyUpHandler);
    });

    it('should map WebSocket events to correct handlers', () => {
      register();

      const wsCalls = mockWebsocketController.on.mock.calls;
      expect(wsCalls.find(call => call[0] === 'ROOM_JOIN')[1]).toBe(RoomHandlers.roomJoinHandler);
      expect(wsCalls.find(call => call[0] === 'USER_CONNECT')[1]).toBe(RoomHandlers.userConnectHandler);
      expect(wsCalls.find(call => call[0] === 'disconnect')[1]).toBe(RoomHandlers.roomDisconnectHandler);
    });

    it('should map RTC events to correct handlers', () => {
      register();

      const rtcCalls = mockRealTimeController.on.mock.calls;
      expect(rtcCalls.find(call => call[0] === 'KEY_DOWN')[1]).toBe(RoomHandlers.keyDownHandler);
      expect(rtcCalls.find(call => call[0] === 'KEY_UP')[1]).toBe(RoomHandlers.keyUpHandler);
    });
  });
});