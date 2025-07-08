import * as NoteActions from '../actions/NoteActions';
import { setRoom, setUserId } from '../actions/RoomActions';
import { store } from '../app/store';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import { selectNotesByMidi } from '../selectors/noteSelectors';
import { selectMyUser, selectWorkspace } from '../selectors/workspaceSelectors';
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

type SustainPayload = {
  userId?: string;
};

export default class RoomHandlers {
  private constructor() { }

  static keyDownHandler(payload: KeyDownPayload) {
    NoteActions.keyDown(payload.note, payload.velocity, payload.userId);
  }

  static keyUpHandler(payload: KeyUpPayload) {
    NoteActions.keyUp(payload.note, payload.userId);
  }

  static sustainDownHandler(payload: SustainPayload) {
    NoteActions.sustainDown(payload.userId);
  }

  static sustainUpHandler(payload: SustainPayload) {
    NoteActions.sustainUp(payload.userId);
  }

  static roomJoinHandler(payload: RoomJoinPayload) {
    const { room, userId } = payload;
    Object.values(room.users ?? {}).forEach(u => {
      InstrumentRegistry.register(u.userId, u.instrument as InstrumentType);
    });

    setUserId(userId);
    setRoom(room);
  }

  static roomDisconnectHandler() {
    window.location.pathname = '/';
  }

  static userConnectHandler(payload: UserConnectPayload) {
    const { userId, room } = payload;
    const instrument = room.users?.[userId].instrument as InstrumentType;
    InstrumentRegistry.register(userId, instrument);

    setRoom(room);
  }

  static userUpdateHandler(payload: UserUpdatePayload) {
    const { room: oldRoom } = selectWorkspace(store);
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

    setRoom(room);
  }

  static userDisconnectHandler(payload: UserDisconnectPayload) {
    const { userId, room } = payload;
    InstrumentRegistry.unregister(userId);
    setRoom(room);
  }

  static blurHandler() {
    const userId = selectMyUser(store)?.userId;
    const notes = selectNotesByMidi(store);
    Object.values(notes).forEach(noteEntries => {
      noteEntries.forEach(note => {
        if (note.peerId === userId) {
          NoteActions.keyUp(note.midi);
        }
      });
    });
  }
}
