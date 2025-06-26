import * as NoteActions from '../actions/NoteActions';
import { store, setStore } from '../app/store';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import { getMyUser, getWorkspace } from '../lib/WorkspaceHelper';
import type { InstrumentType } from '../audio/instruments/Instrument';
import type { Room } from '../lib/workspaceTypes';



type KeyDownPayload = {
  note: number;
  velocity: number;
  userId?: string;
};

type KeyUpPayload = {
  note: number;
  userId?: string;
};

type RoomJoinPayload = {
  room: Room;
  userId: string;
};

type UserConnectPayload = {
  room: Room;
  userId: string;
};

type UserUpdatePayload = {
  room: Room,
  userId: string,
};

type UserDisconnectPayload = {
  room: Room,
  userId: string,
};

export default class RoomHandlers {
  private constructor() { }

  static keyDownHandler(payload: KeyDownPayload) {
    NoteActions.keyDown(payload.note, payload.velocity, payload.userId);
  }

  static keyUpHandler(payload: KeyUpPayload) {
    NoteActions.keyUp(payload.note, payload.userId);
  }

  static roomJoinHandler(payload: RoomJoinPayload) {
    const { room, userId } = payload;
    Object.values(room.users).forEach(u => {
      InstrumentRegistry.register(u.userId, u.instrument as InstrumentType);
    });

    setStore('workspace', 'userId', userId);
    setStore('workspace', 'room', room);
  }

  static roomDisconnectHandler() {
    window.location.pathname = '/';
  }

  static userConnectHandler(payload: UserConnectPayload) {
    const { userId, room } = payload;
    const instrument = room.users?.[userId].instrument as InstrumentType;
    InstrumentRegistry.register(userId, instrument);

    setStore('workspace', 'room', room);
  }

  static userUpdateHandler(payload: UserUpdatePayload) {
    const { room: oldRoom } = getWorkspace();
    const { userId, room } = payload;
    const oldUser = oldRoom?.users?.[userId];
    const newUser = room?.users?.[userId];
    if (!newUser) {
      return;
    }
    const newInstrument = newUser.instrument as InstrumentType;

    if (oldUser?.instrument !== newInstrument) {
      InstrumentRegistry.register(userId, newInstrument);
    }

    setStore('workspace', 'room', room);
  }

  static userDisconnectHandler(payload: UserDisconnectPayload) {
    const { userId, room } = payload;
    InstrumentRegistry.unregister(userId);
    // TODO: Implement removeNotesFromPeer in SolidJS store
    // setStore('notesByMidi', ...);
    setStore('workspace', 'room', room);
  }

  static blurHandler() {
    const userId = getMyUser()?.userId;
    const notes = store.notesByMidi;
    Object.values(notes).forEach(noteEntries => {
      noteEntries.forEach(note => {
        if (note.peerId === userId) {
          NoteActions.keyUp(note.midi);
        }
      });
    });
  }
}
