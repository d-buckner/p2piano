import { setStore } from '../app/store';
import { ensureSession, getRoom } from '../clients/RoomClient';
import { Transport } from '../constants';
import ClientPreferences from '../lib/ClientPreferences';
import * as RoomActionBridge from '../lib/RoomActionBridge';
import { getMyUser, getWorkspace } from '../lib/WorkspaceHelper';
import WebRtcController from '../networking/transports/WebRtcController';
import WebsocketController from '../networking/transports/WebsocketController';
import type { InstrumentType } from '../audio/instruments/Instrument';


export async function joinRoom(roomId: string) {
  setStore('workspace', 'roomId', roomId);
  setStore('workspace', 'isLoading', true);

  let isValid = true;
  try {
    const { room } = getWorkspace();
    if (!room) {
      const room = await getRoom(roomId);
      setStore('workspace', 'room', room);
      Object.values(room.users).forEach(user => {
        setStore('connection', 'peerConnections', user.userId, {
          latency: 0,
          transport: Transport.WEBSOCKET,
        });
      });
    }

    await ensureSession();
  } catch {
    isValid = false;
  }

  setStore('workspace', 'isValid', isValid);
  setStore('workspace', 'isLoading', false);

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
  // Reset workspace state
  setStore('workspace', {
    roomId: undefined,
    userId: undefined,
    isValid: undefined,
    isLoading: undefined,
    room: undefined,
  });
}
