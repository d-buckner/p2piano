import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as NoteActions from '../actions/NoteActions';
import { setRoom, setUserId } from '../actions/RoomActions';
import { InstrumentType } from '../audio/instruments/Instrument';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import '../lib/Logger'; // Import Logger so it's available when handlers run
import { NoteManager } from '../lib/NoteManager';
import { selectWorkspace, selectMyUser } from '../selectors/workspaceSelectors';
import { createTestRoom, createTestUser} from '../test-utils/testDataFactories';
import RoomHandlers from './RoomHandlers';

// Mock AudioEngine service
const mockAudioEngine = {
  isReady: vi.fn(() => true),
  initialize: vi.fn(),
  registerInstrument: vi.fn(),
  unregisterInstrument: vi.fn(),
  scheduleEvent: vi.fn()
};

// Mock AppContainer
vi.mock('../core/AppContainer', () => ({
  appContainer: {
    resolve: vi.fn((token) => {
      if (token.name === 'AudioEngine') {
        return mockAudioEngine;
      }
      throw new Error(`Service ${token.name} is not registered`);
    })
  }
}));

// Mock all dependencies
vi.mock('../actions/NoteActions', () => ({
  keyDown: vi.fn(),
  keyUp: vi.fn(),
  sustainDown: vi.fn(),
  sustainUp: vi.fn(),
}));

vi.mock('../actions/RoomActions', () => ({
  setRoom: vi.fn(),
  setUserId: vi.fn(),
}));

vi.mock('../audio/instruments/InstrumentRegistry', () => ({
  default: {
    register: vi.fn(),
    unregister: vi.fn(),
  },
}));

vi.mock('../selectors/workspaceSelectors', () => ({
  selectWorkspace: vi.fn(),
  selectMyUser: vi.fn(),
}));

vi.mock('../lib/NoteManager', () => ({
  NoteManager: {
    releaseAllNotesForUser: vi.fn(),
  },
}));

vi.mock('../app/store', () => ({
  store: {},
}));

describe('RoomHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location using vi.stubGlobal
    vi.stubGlobal('location', { pathname: '' });
    // Reset audio engine mock
    mockAudioEngine.isReady.mockReturnValue(true);
    mockAudioEngine.registerInstrument.mockResolvedValue(undefined);
    mockAudioEngine.unregisterInstrument.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('keyDownHandler', () => {
    it('should call NoteActions.keyDown with correct parameters', () => {
      const payload = {
        note: 60,
        velocity: 100,
        userId: 'user123',
      };

      RoomHandlers.keyDownHandler(payload);

      expect(NoteActions.keyDown).toHaveBeenCalledWith(60, 100, 'user123');
    });

    it('should handle payload without userId', () => {
      const payload = {
        note: 72,
        velocity: 80,
      };

      RoomHandlers.keyDownHandler(payload);

      expect(NoteActions.keyDown).toHaveBeenCalledWith(72, 80, undefined);
    });
  });

  describe('keyUpHandler', () => {
    it('should call NoteActions.keyUp with correct parameters', () => {
      const payload = {
        note: 60,
        userId: 'user123',
      };

      RoomHandlers.keyUpHandler(payload);

      expect(NoteActions.keyUp).toHaveBeenCalledWith(60, 'user123');
    });

    it('should handle payload without userId', () => {
      const payload = {
        note: 72,
      };

      RoomHandlers.keyUpHandler(payload);

      expect(NoteActions.keyUp).toHaveBeenCalledWith(72, undefined);
    });
  });

  describe('sustainDownHandler', () => {
    it('should call NoteActions.sustainDown with userId', () => {
      const payload = {
        userId: 'user123',
      };

      RoomHandlers.sustainDownHandler(payload);

      expect(NoteActions.sustainDown).toHaveBeenCalledWith('user123');
    });

    it('should handle payload without userId', () => {
      const payload = {};

      RoomHandlers.sustainDownHandler(payload);

      expect(NoteActions.sustainDown).toHaveBeenCalledWith(undefined);
    });
  });

  describe('sustainUpHandler', () => {
    it('should call NoteActions.sustainUp with userId', () => {
      const payload = {
        userId: 'user123',
      };

      RoomHandlers.sustainUpHandler(payload);

      expect(NoteActions.sustainUp).toHaveBeenCalledWith('user123');
    });

    it('should handle payload without userId', () => {
      const payload = {};

      RoomHandlers.sustainUpHandler(payload);

      expect(NoteActions.sustainUp).toHaveBeenCalledWith(undefined);
    });
  });

  describe('roomJoinHandler', () => {
    it('should register all users and set room state', () => {
      const room = createTestRoom();
      const payload = {
        room,
        userId: 'user1',
      };

      RoomHandlers.roomJoinHandler(payload);

      expect(mockAudioEngine.registerInstrument).toHaveBeenCalledWith('user1', InstrumentType.PIANO);
      expect(mockAudioEngine.registerInstrument).toHaveBeenCalledWith('user2', InstrumentType.SYNTH);
      expect(setUserId).toHaveBeenCalledWith('user1');
      expect(setRoom).toHaveBeenCalledWith(room);
    });

    it('should handle room with no users', () => {
      const room = createTestRoom({ users: {} });
      const payload = {
        room,
        userId: 'user1',
      };

      RoomHandlers.roomJoinHandler(payload);

      expect(InstrumentRegistry.register).not.toHaveBeenCalled();
      expect(setUserId).toHaveBeenCalledWith('user1');
      expect(setRoom).toHaveBeenCalledWith(payload.room);
    });
  });

  describe('newerConnectionHandler', () => {
    it('should redirect to home page', () => {
      RoomHandlers.newerConnectionHandler();

      expect(window.location.pathname).toBe('/');
    });
  });

  describe('userConnectHandler', () => {
    it('should register new user and update room', () => {
      const payload = {
        room: {
          id: 'room123',
          users: {
            newUser: { userId: 'newUser', instrument: InstrumentType.ELECTRIC_BASS },
          },
        },
        userId: 'newUser',
      };

      RoomHandlers.userConnectHandler(payload);

      expect(mockAudioEngine.registerInstrument).toHaveBeenCalledWith('newUser', InstrumentType.ELECTRIC_BASS);
      expect(setRoom).toHaveBeenCalledWith(payload.room);
    });
  });

  describe('userUpdateHandler', () => {
    it('should re-register user when instrument changes', () => {
      const oldRoom = {
        users: {
          user1: { userId: 'user1', instrument: InstrumentType.PIANO },
        },
      };
      const newRoom = {
        users: {
          user1: { userId: 'user1', instrument: InstrumentType.SYNTH },
        },
      };

      vi.mocked(selectWorkspace).mockReturnValue({ room: oldRoom } as ReturnType<typeof selectWorkspace>);

      const payload = {
        room: newRoom,
        userId: 'user1',
      };

      RoomHandlers.userUpdateHandler(payload);

      expect(mockAudioEngine.registerInstrument).toHaveBeenCalledWith('user1', InstrumentType.SYNTH);
      expect(setRoom).toHaveBeenCalledWith(newRoom);
    });

    it('should not re-register when instrument unchanged', () => {
      const room = {
        users: {
          user1: { userId: 'user1', instrument: InstrumentType.PIANO },
        },
      };

      vi.mocked(selectWorkspace).mockReturnValue({ room } as ReturnType<typeof selectWorkspace>);

      const payload = {
        room,
        userId: 'user1',
      };

      RoomHandlers.userUpdateHandler(payload);

      expect(InstrumentRegistry.register).not.toHaveBeenCalled();
      expect(setRoom).toHaveBeenCalledWith(room);
    });

    it('should handle missing user gracefully', () => {
      vi.mocked(selectWorkspace).mockReturnValue({ room: { users: {} } } as ReturnType<typeof selectWorkspace>);

      const payload = {
        room: { users: {} },
        userId: 'nonexistent',
      };

      RoomHandlers.userUpdateHandler(payload);

      expect(InstrumentRegistry.register).not.toHaveBeenCalled();
      expect(setRoom).not.toHaveBeenCalled();
    });
  });

  describe('userDisconnectHandler', () => {
    it('should unregister user and update room', () => {
      const payload = {
        room: {
          id: 'room123',
          users: {
            remainingUser: { userId: 'remainingUser', instrument: InstrumentType.PIANO },
          },
        },
        userId: 'disconnectedUser',
      };

      RoomHandlers.userDisconnectHandler(payload);

      expect(mockAudioEngine.unregisterInstrument).toHaveBeenCalledWith('disconnectedUser');
      expect(setRoom).toHaveBeenCalledWith(payload.room);
    });
  });

  describe('blurHandler', () => {
    it('should release all notes for current user', () => {
      const currentUser = createTestUser({ userId: 'currentUser' });
      vi.mocked(selectMyUser).mockReturnValue(currentUser);

      RoomHandlers.blurHandler();

      expect(NoteManager.releaseAllNotesForUser).toHaveBeenCalledWith('currentUser');
    });

    it('should handle no current user', () => {
      vi.mocked(selectMyUser).mockReturnValue(null);

      RoomHandlers.blurHandler();

      expect(NoteManager.releaseAllNotesForUser).not.toHaveBeenCalled();
    });

    it('should handle user without userId', () => {
      const currentUser = createTestUser({ userId: undefined });
      vi.mocked(selectMyUser).mockReturnValue(currentUser);

      RoomHandlers.blurHandler();

      expect(NoteManager.releaseAllNotesForUser).not.toHaveBeenCalled();
    });
  });

});
