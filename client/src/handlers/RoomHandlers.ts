import { batch } from 'react-redux';
import store, { dispatch } from '../app/store';
import * as NoteActions from '../actions/NoteActions';
import InstrumentRegistry from '../instruments/InstrumentRegistry';
import {
  setRoom,
  setConnection,
  removeConnection,
  initializeRoom,
} from '../slices/workspaceSlice';
import { InstrumentType } from '../instruments/Instrument';
import { getMyUser, getWorkspace } from '../lib/WorkspaceHelper';
import { removeNotesFromPeer, selectNotes } from '../slices/notesSlice';
import { Transport } from '../constants';

import type { Room } from '../lib/workspaceTypes';

type KeyDownPayload = {
  midi: number;
  velocity: number;
  userId: string;
};

type KeyUpPayload = {
  midi: number;
  userId: string;
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
    NoteActions.keyDown(payload.midi, payload.velocity, payload.userId);
  }

  static keyUpHandler(payload: KeyUpPayload) {
    NoteActions.keyUp(payload.midi, payload.userId);
  }

  static roomJoinHandler(payload: RoomJoinPayload) {
    const { room, userId } = payload;
    Object.values(room.users).forEach(u => {
      InstrumentRegistry.register(u.userId, u.instrument as InstrumentType);
    });
    dispatch(initializeRoom({
      userId,
      room,
    }));
  }

  static roomDisconnectHandler() {
    window.location.pathname = '/';
  }

  static userConnectHandler(payload: UserConnectPayload) {
    const { userId, room } = payload;
    const instrument = room.users[userId].instrument as InstrumentType;
    InstrumentRegistry.register(userId, instrument);
    batch(() => {
      dispatch(setConnection({
        userId,
        transport: Transport.WEBSOCKETS,
      }))
      dispatch(setRoom({ room }));
    })
  }

  static userUpdateHandler(payload: UserUpdatePayload) {
    const { room: oldRoom } = getWorkspace();
    const { userId, room } = payload;
    const oldUser = oldRoom?.users[userId];
    const newUser = room?.users[userId];
    const newInstrument = newUser.instrument as InstrumentType;

    if (oldUser?.instrument !== newInstrument) {
      InstrumentRegistry.register(userId, newInstrument);
    }

    dispatch(setRoom({ room }));
  }

  static userDisconnectHandler(payload: UserDisconnectPayload) {
    const { userId, room } = payload;
    InstrumentRegistry.deregister(userId);
    batch(() => {
      dispatch(removeNotesFromPeer({ peerId: userId }));
      dispatch(removeConnection({ userId }));
      dispatch(setRoom({ room }));
    });
  }

  static blurHandler() {
    const userId = getMyUser()?.userId;
    const notes = selectNotes(store.getState());
    Object.values(notes).forEach(noteEntries => {
      noteEntries.forEach(note => {
        if (note.peerId === userId) {
          NoteActions.keyUp(note.midi);
        }
      });
    });
  }
}
