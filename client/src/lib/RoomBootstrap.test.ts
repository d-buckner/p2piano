import HuMIDI from 'humidi';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as NoteActions from '../actions/NoteActions';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import AudioSyncCoordinator from '../audio/syncronization/AudioSyncCoordinator';
import KeyboardController from '../controllers/KeyboardController';
import RoomHandlers from '../handlers/RoomHandlers';
import { bootstrap, enableCollaboration, loadEnhancements, cleanup } from './RoomBootstrap';


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
    sustainDownHandler: vi.fn(),
    sustainUpHandler: vi.fn(),
    roomJoinHandler: vi.fn(),
    userConnectHandler: vi.fn(),
    userDisconnectHandler: vi.fn(),
    userUpdateHandler: vi.fn(),
    newerConnectionHandler: vi.fn(),
    blurHandler: vi.fn(),
  },
}));

vi.mock('../handlers/MetronomeHandlers', () => ({
  default: {
    tickHandler: vi.fn(),
  },
}));

vi.mock('../audio/AudioManager', () => ({
  default: {
    whenActive: vi.fn((callback) => callback()), // Execute immediately for tests
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

const mockSharedStoreRoot = {
  initialize: vi.fn(),
  dispose: vi.fn(),
};

vi.mock('../crdt', () => ({
  sharedStoreRoot: mockSharedStoreRoot,
}));
const mockKeyboardController = {
  registerKeyDownHandler: vi.fn(),
  registerKeyUpHandler: vi.fn(),
  destroy: vi.fn(),
};

const mockRealTimeController = {
  on: vi.fn(),
  off: vi.fn(),
};

const mockWebsocketController = {
  on: vi.fn(),
  connect: vi.fn(),
};

describe('RoomBootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
  });

  describe('bootstrap()', () => {
    it('should register keyboard handlers for immediate local piano interaction', () => {
      bootstrap();

      expect(KeyboardController.getInstance).toHaveBeenCalled();
      expect(mockKeyboardController.registerKeyDownHandler).toHaveBeenCalledWith(NoteActions.keyDown);
      expect(mockKeyboardController.registerKeyUpHandler).toHaveBeenCalledWith(NoteActions.keyUp);
    });

    it('should start WebSocket connection without waiting', () => {
      bootstrap();

      expect(mockWebsocketController.connect).toHaveBeenCalled();
    });

    it('should not initialize CRDT system in bootstrap phase', () => {
      bootstrap();

      expect(mockSharedStoreRoot.initialize).not.toHaveBeenCalled();
    });

    it('should not start AudioSyncCoordinator in bootstrap phase', () => {
      bootstrap();

      expect(AudioSyncCoordinator.start).not.toHaveBeenCalled();
    });

    it('should not register MIDI handlers in bootstrap phase', () => {
      bootstrap();

      expect(HuMIDI.on).not.toHaveBeenCalled();
    });

    it('should register WebSocket handlers', () => {
      bootstrap();

      expect(mockWebsocketController.on).toHaveBeenCalledWith('ROOM_JOIN', RoomHandlers.roomJoinHandler);
      expect(mockWebsocketController.on).toHaveBeenCalledWith('USER_CONNECT', RoomHandlers.userConnectHandler);
      expect(mockWebsocketController.on).toHaveBeenCalledWith('USER_DISCONNECT', RoomHandlers.userDisconnectHandler);
      expect(mockWebsocketController.on).toHaveBeenCalledWith('USER_UPDATE', RoomHandlers.userUpdateHandler);
      expect(mockWebsocketController.on).toHaveBeenCalledWith('NEWER_CONNECTION', RoomHandlers.newerConnectionHandler);
    });
  });

  describe('enableCollaboration()', () => {
    it('should register RealTimeController handlers', async () => {
      const { default: MetronomeHandlers } = await import('../handlers/MetronomeHandlers');
      
      await enableCollaboration();

      expect(mockRealTimeController.on).toHaveBeenCalledWith('KEY_DOWN', RoomHandlers.keyDownHandler);
      expect(mockRealTimeController.on).toHaveBeenCalledWith('KEY_UP', RoomHandlers.keyUpHandler);
      expect(mockRealTimeController.on).toHaveBeenCalledWith('SUSTAIN_DOWN', RoomHandlers.sustainDownHandler);
      expect(mockRealTimeController.on).toHaveBeenCalledWith('SUSTAIN_UP', RoomHandlers.sustainUpHandler);
      expect(mockRealTimeController.on).toHaveBeenCalledWith('METRONOME_TICK', MetronomeHandlers.tickHandler);
    });

    it('should initialize CRDT immediately without waiting for ROOM_JOIN', async () => {
      await enableCollaboration();

      expect(mockSharedStoreRoot.initialize).toHaveBeenCalledWith(mockRealTimeController);
    });

    it('should start AudioSyncCoordinator immediately', async () => {
      await enableCollaboration();

      expect(AudioSyncCoordinator.start).toHaveBeenCalled();
    });

  });

  describe('loadEnhancements()', () => {
    it('should register MIDI handlers', async () => {
      await loadEnhancements();

      expect(HuMIDI.on).toHaveBeenCalledWith('noteon', RoomHandlers.keyDownHandler);
      expect(HuMIDI.on).toHaveBeenCalledWith('noteoff', RoomHandlers.keyUpHandler);
      expect(HuMIDI.on).toHaveBeenCalledWith('sustainon', RoomHandlers.sustainDownHandler);
      expect(HuMIDI.on).toHaveBeenCalledWith('sustainoff', RoomHandlers.sustainUpHandler);
    });

    it('should register window blur handler', async () => {
      await loadEnhancements();

      expect(window.addEventListener).toHaveBeenCalledWith('blur', RoomHandlers.blurHandler);
    });
  });

  describe('cleanup()', () => {
    it('should reset HuMIDI', () => {
      cleanup();

      expect(HuMIDI.reset).toHaveBeenCalled();
    });

    it('should empty instrument registry', () => {
      cleanup();

      expect(InstrumentRegistry.empty).toHaveBeenCalled();
    });

    it('should destroy keyboard controller', () => {
      cleanup();

      expect(mockKeyboardController.destroy).toHaveBeenCalled();
    });

    it('should stop audio sync coordinator', () => {
      cleanup();

      expect(AudioSyncCoordinator.stop).toHaveBeenCalled();
    });

    it('should remove window blur handler', () => {
      cleanup();

      expect(window.removeEventListener).toHaveBeenCalledWith('blur', RoomHandlers.blurHandler);
    });

    it('should dispose CRDT system if it was loaded', async () => {
      await enableCollaboration();
      
      cleanup();

      expect(mockSharedStoreRoot.dispose).toHaveBeenCalled();
    });
  });

  describe('3-phase architecture integration', () => {
    it('should follow the correct phase sequence for complete setup', async () => {
      bootstrap();
      
      expect(mockKeyboardController.registerKeyDownHandler).toHaveBeenCalled();
      expect(mockWebsocketController.connect).toHaveBeenCalled();
      expect(mockSharedStoreRoot.initialize).not.toHaveBeenCalled();

      await enableCollaboration();
      
      expect(mockWebsocketController.on).toHaveBeenCalled();
      expect(mockRealTimeController.on).toHaveBeenCalled();
      expect(mockSharedStoreRoot.initialize).toHaveBeenCalled();
      expect(AudioSyncCoordinator.start).toHaveBeenCalled();

      await loadEnhancements();
      
      expect(HuMIDI.on).toHaveBeenCalled();
      expect(window.addEventListener).toHaveBeenCalled();

      cleanup();
      
      expect(mockKeyboardController.destroy).toHaveBeenCalled();
      expect(mockSharedStoreRoot.dispose).toHaveBeenCalled();
    });

    it('should handle phases independently', async () => {
      bootstrap();
      expect(mockKeyboardController.registerKeyDownHandler).toHaveBeenCalled();

      await loadEnhancements();
      expect(HuMIDI.on).toHaveBeenCalled();

      cleanup();
      expect(mockKeyboardController.destroy).toHaveBeenCalled();
      expect(HuMIDI.reset).toHaveBeenCalled();
    });

    it('should not register the same handlers in multiple phases', async () => {
      bootstrap();
      expect(mockKeyboardController.registerKeyDownHandler).toHaveBeenCalledTimes(1);
      expect(mockWebsocketController.on).toHaveBeenCalled();
      
      await enableCollaboration();
      expect(mockRealTimeController.on).toHaveBeenCalled();
      expect(mockKeyboardController.registerKeyDownHandler).toHaveBeenCalledTimes(1);

      await loadEnhancements();
      expect(HuMIDI.on).toHaveBeenCalled();
      expect(mockKeyboardController.registerKeyDownHandler).toHaveBeenCalledTimes(1);
    });
  });
});
