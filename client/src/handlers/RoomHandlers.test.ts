import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as NoteActions from '../actions/NoteActions';
import { setRoom, setUserId } from '../actions/RoomActions';
import { InstrumentType } from '../audio/instruments/Instrument';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import { selectNotesByMidi } from '../selectors/noteSelectors';
import { selectWorkspace, selectMyUser } from '../selectors/workspaceSelectors';
import { createTestRoom, createTestUser, createTestNotesByMidi } from '../test-utils/testDataFactories';
import RoomHandlers from './RoomHandlers';

// Mock all dependencies
vi.mock('../actions/NoteActions', () => ({
  keyDown: vi.fn(),
  keyUp: vi.fn(),
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

vi.mock('../selectors/noteSelectors', () => ({
  selectNotesByMidi: vi.fn(),
}));

vi.mock('../app/store', () => ({
  store: {},
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { pathname: '' },
  writable: true,
});

describe('RoomHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  describe('roomJoinHandler', () => {
    it('should register all users and set room state', () => {
      const room = createTestRoom();
      const payload = {
        room,
        userId: 'user1',
      };

      RoomHandlers.roomJoinHandler(payload);

      expect(InstrumentRegistry.register).toHaveBeenCalledWith('user1', InstrumentType.PIANO);
      expect(InstrumentRegistry.register).toHaveBeenCalledWith('user2', InstrumentType.SYNTH);
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

  describe('roomDisconnectHandler', () => {
    it('should redirect to home page', () => {
      RoomHandlers.roomDisconnectHandler();

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

      expect(InstrumentRegistry.register).toHaveBeenCalledWith('newUser', InstrumentType.ELECTRIC_BASS);
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

      expect(InstrumentRegistry.register).toHaveBeenCalledWith('user1', InstrumentType.SYNTH);
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

      expect(InstrumentRegistry.unregister).toHaveBeenCalledWith('disconnectedUser');
      expect(setRoom).toHaveBeenCalledWith(payload.room);
    });
  });

  describe('blurHandler', () => {
    it('should release all notes for current user', () => {
      const currentUser = createTestUser({ userId: 'currentUser' });
      const mockNotes = createTestNotesByMidi([
        { midi: 60, peerId: 'currentUser' },
        { midi: 60, peerId: 'otherUser' },
        { midi: 64, peerId: 'currentUser' },
        { midi: 67, peerId: 'otherUser' },
      ]);

      vi.mocked(selectMyUser).mockReturnValue(currentUser);
      vi.mocked(selectNotesByMidi).mockReturnValue(mockNotes);

      RoomHandlers.blurHandler();

      expect(NoteActions.keyUp).toHaveBeenCalledWith(60);
      expect(NoteActions.keyUp).toHaveBeenCalledWith(64);
      expect(NoteActions.keyUp).not.toHaveBeenCalledWith(67);
      expect(NoteActions.keyUp).toHaveBeenCalledTimes(2);
    });

    it('should handle no current user', () => {
      vi.mocked(selectMyUser).mockReturnValue(null);
      vi.mocked(selectNotesByMidi).mockReturnValue({});

      RoomHandlers.blurHandler();

      expect(NoteActions.keyUp).not.toHaveBeenCalled();
    });

    it('should handle empty notes', () => {
      const currentUser = createTestUser({ userId: 'currentUser' });
      vi.mocked(selectMyUser).mockReturnValue(currentUser);
      vi.mocked(selectNotesByMidi).mockReturnValue({});

      RoomHandlers.blurHandler();

      expect(NoteActions.keyUp).not.toHaveBeenCalled();
    });
  });

});