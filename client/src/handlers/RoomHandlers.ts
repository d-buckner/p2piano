import * as NoteActions from '../actions/NoteActions';
import { setRoom, setUserId } from '../actions/RoomActions';
import { store } from '../app/store';
import { appContainer } from '../core/AppContainer';
import { ServiceTokens } from '../core/ServiceTokens';
import Logger from '../lib/Logger';
import { NoteManager } from '../lib/NoteManager';
import { selectMyUser, selectWorkspace } from '../selectors/workspaceSelectors';
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

  public static keyDownHandler(payload: KeyDownPayload) {
    NoteActions.keyDown(payload.note, payload.velocity, payload.userId);
  }

  public static keyUpHandler(payload: KeyUpPayload) {
    NoteActions.keyUp(payload.note, payload.userId);
  }

  public static sustainDownHandler(payload: SustainPayload) {
    NoteActions.sustainDown(payload.userId);
  }

  public static sustainUpHandler(payload: SustainPayload) {
    NoteActions.sustainUp(payload.userId);
  }

  public static roomJoinHandler(payload: RoomJoinPayload) {
    const { room, userId } = payload;
    const audioEngine = appContainer.resolve(ServiceTokens.AudioEngine);
    
    Object.values(room.users ?? {}).forEach(u => {
      audioEngine.registerInstrument(u.userId, u.instrument as string);
    });

    setUserId(userId);
    setRoom(room);
  }

  public static userConnectHandler(payload: UserConnectPayload) {
    const { userId, room } = payload;
    const audioEngine = appContainer.resolve(ServiceTokens.AudioEngine);
    const instrument = room.users?.[userId].instrument as string;
    audioEngine.registerInstrument(userId, instrument);

    setRoom(room);
  }

  public static userUpdateHandler(payload: UserUpdatePayload) {
    const { room: oldRoom } = selectWorkspace(store);
    const { userId, room } = payload;
    const oldUser = oldRoom?.users?.[userId];
    const newUser = room?.users?.[userId];
    if (!newUser) {
      return;
    }
    const newInstrument = newUser.instrument as string;

    if (oldUser?.instrument !== newInstrument) {
      const audioEngine = appContainer.resolve(ServiceTokens.AudioEngine);
      audioEngine.registerInstrument(userId, newInstrument);
    }

    setRoom(room);
  }

  public static userDisconnectHandler(payload: UserDisconnectPayload) {
    const { userId, room } = payload;
    const audioEngine = appContainer.resolve(ServiceTokens.AudioEngine);
    audioEngine.unregisterInstrument(userId);
    NoteManager.releaseAllNotesForUser(userId);
    setRoom(room);
  }

  public static newerConnectionHandler() {
    Logger.ERROR('Booted for newer connection');
    window.location.pathname = '/';
  }

  public static blurHandler() {
    const userId = selectMyUser(store)?.userId;
    if (userId) {
      NoteManager.releaseAllNotesForUser(userId);
    }
  }
}
