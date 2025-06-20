import { dispatch } from '../app/store';
import { ensureSession, getRoom } from '../clients/RoomClient';
import WebRtcController from '../networking/transports/WebRtcController';
import WebsocketController from '../networking/transports/WebsocketController';
import ClientPreferences from '../lib/ClientPreferences';
import {
  setRoomId,
  setValidity,
  reset,
  setIsLoading,
  setRoom,
} from '../slices/workspaceSlice';
import * as RoomActionBridge from '../lib/RoomActionBridge';
import { getMyUser, getWorkspace } from '../lib/WorkspaceHelper';
import { InstrumentType } from '../audio/instruments/Instrument';
import { connectionActions } from '../slices/connectionSlice';
import { Transport } from '../constants';

export async function joinRoom(roomId: string) {
  dispatch(setRoomId({ roomId }));
  dispatch(setIsLoading({ isLoading: true }));

  let isValid = true;
  try {
    const { room } = getWorkspace();
    if (!room) {
      const room = await getRoom(roomId);
      dispatch(setRoom({ room }));
      Object.values(room.users).forEach(user => {
        dispatch(connectionActions.addPeerConnection({
          peerId: user.userId,
          transport: Transport.WEBSOCKET,
        }));
      });
    }

    await ensureSession();
  } catch {
    isValid = false;
  }

  dispatch(setValidity({ isValid }));
  dispatch(setIsLoading({ isLoading: false }));

  if (isValid) {
    RoomActionBridge.register();
  }
}

export function updateDisplayName(displayName: string) {
  // TODO: update optimistically
  const user = getMyUser();
  if (!user) {
    return;
  }
  ClientPreferences.setDisplayName(displayName);
  WebsocketController.getInstance().broadcast('USER_UPDATE', {
    ...user,
    displayName,
  });
}

export function updateInstrument(instrument: InstrumentType) {
  // TODO: update optimistically
  const user = getMyUser();
  if (!user) {
    return;
  }
  WebsocketController.getInstance().broadcast('USER_UPDATE', {
    ...user,
    instrument,
  });
}

export function destroyRoom() {
  RoomActionBridge.destroy();
  WebRtcController.destroy();
  WebsocketController.destroy();
  dispatch(reset());
}
