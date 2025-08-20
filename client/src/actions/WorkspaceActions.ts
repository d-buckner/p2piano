import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import { getRoom } from '../clients/RoomClient';
import { Transport } from '../constants';
import ClientPreferences from '../lib/ClientPreferences';
import { defer } from '../lib/defer';
import * as RoomBootstrap from '../lib/RoomBootstrap';
import WebRtcController from '../networking/transports/WebRtcController';
import WebsocketController from '../networking/transports/WebsocketController';
import { selectMyUser, selectWorkspace } from '../selectors/workspaceSelectors';
import { workspaceStore, setWorkspaceStore } from '../stores/WorkspaceStore';
import { addPeerConnection } from './ConnectionActions';
import type { InstrumentType } from '../audio/instruments/Instrument';


const Attributes = {
  ROOM_ID: 'roomId',
  USER_ID: 'userId',
  IS_VALID: 'isValid',
  IS_LOADING: 'isLoading',
  ROOM: 'room',
} as const;

export async function joinRoom(roomId: string) {
  setWorkspaceStore(Attributes.ROOM_ID, roomId);
  setWorkspaceStore(Attributes.IS_LOADING, true);

  let isValid = true;
  try {
    const { room } = selectWorkspace({ workspace: workspaceStore });
    if (!room) {
      const room = await getRoom(roomId);
      setWorkspaceStore(Attributes.ROOM, room);
      Object.values(room.users ?? {}).forEach(user => {
        addPeerConnection(user.userId, Transport.WEBSOCKET, 0);
      });
    }
  } catch {
    isValid = false;
  }

  setWorkspaceStore(Attributes.IS_VALID, isValid);
  setWorkspaceStore(Attributes.IS_LOADING, false);

  if (isValid) {
    const RoomBootstrap = await import('../lib/RoomBootstrap');
    // Phase 1: Bootstrap essential features (deferred)
    defer(RoomBootstrap.bootstrap);
    
    // Phase 2 & 3: Enable collaboration and enhancements (deferred)
    await RoomBootstrap.enableCollaboration();
    await RoomBootstrap.loadEnhancements();
  }
}

export function updateDisplayName(displayName: string) {
  const user = selectMyUser({ workspace: workspaceStore });
  if (!user) {
    return;
  }
  
  // Update optimistically - focused update to just the user's displayName
  setWorkspaceStore(Attributes.ROOM, 'users', user.userId, 'displayName', displayName);
  
  ClientPreferences.setDisplayName(displayName);
  WebsocketController.getInstance().broadcast('USER_UPDATE', {
    ...user,
    displayName,
  });
}

export function updateInstrument(instrument: InstrumentType) {
  const user = selectMyUser({ workspace: workspaceStore });
  if (!user) {
    return;
  }
  
  // Update optimistically - focused update to just the user's instrument
  setWorkspaceStore(Attributes.ROOM, 'users', user.userId, 'instrument', instrument);
  
  // Update instrument registry immediately for optimistic update
  InstrumentRegistry.register(user.userId, instrument);
  
  WebsocketController.getInstance().broadcast('USER_UPDATE', {
    ...user,
    instrument,
  });
}

export function destroyRoom() {
  RoomBootstrap.cleanup();
  WebRtcController.destroy();
  WebsocketController.destroy();
  // Reset workspace state
  setWorkspaceStore({
    roomId: undefined,
    userId: undefined,
    isValid: undefined,
    isLoading: undefined,
    room: undefined,
  });
}
