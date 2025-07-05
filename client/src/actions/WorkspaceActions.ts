import { setStore, store } from '../app/store';
import { getRoom } from '../clients/RoomClient';
import { Transport } from '../constants';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import ClientPreferences from '../lib/ClientPreferences';
import * as EventCoordinator from '../lib/EventCoordinator';
import WebRtcController from '../networking/transports/WebRtcController';
import WebsocketController from '../networking/transports/WebsocketController';
import { selectMyUser, selectWorkspace } from '../selectors/workspaceSelectors';
import type { InstrumentType } from '../audio/instruments/Instrument';


export async function joinRoom(roomId: string) {
  setStore('workspace', 'roomId', roomId);
  setStore('workspace', 'isLoading', true);

  let isValid = true;
  try {
    const { room } = selectWorkspace(store);
    if (!room) {
      const room = await getRoom(roomId);
      setStore('workspace', 'room', room);
      Object.values(room.users ?? {}).forEach(user => {
        setStore('connection', 'peerConnections', user.userId, {
          latency: 0,
          transport: Transport.WEBSOCKET,
        });
      });
    }
  } catch {
    isValid = false;
  }

  setStore('workspace', 'isValid', isValid);
  setStore('workspace', 'isLoading', false);

  if (isValid) {
    EventCoordinator.register();
  }
}

export function updateDisplayName(displayName: string) {
  const user = selectMyUser(store);
  if (!user) {
    return;
  }
  
  // Update optimistically - focused update to just the user's displayName
  setStore('workspace', 'room', 'users', user.userId, 'displayName', displayName);
  
  ClientPreferences.setDisplayName(displayName);
  WebsocketController.getInstance().broadcast('USER_UPDATE', {
    ...user,
    displayName,
  });
}

export function updateInstrument(instrument: InstrumentType) {
  const user = selectMyUser(store);
  if (!user) {
    return;
  }
  
  // Update optimistically - focused update to just the user's instrument
  setStore('workspace', 'room', 'users', user.userId, 'instrument', instrument);
  
  // Update instrument registry immediately for optimistic update
  InstrumentRegistry.register(user.userId, instrument);
  
  WebsocketController.getInstance().broadcast('USER_UPDATE', {
    ...user,
    instrument,
  });
}

export function destroyRoom() {
  EventCoordinator.destroy();
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
