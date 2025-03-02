import store from '../app/store';
import { Transports } from '../constants';
import { selectWorkspace } from '../slices/workspaceSlice';

export function getUsers() {
  const { room } = getWorkspace();
  return room?.users || {};
}

export function getUser(userId: string) {
  return getUsers()[userId];
}

export function getUsersArray() {
  return Object.values(getUsers());
}

export function isConnectionWebRtc(userId: string) {
  const { connections } = getWorkspace();
  return connections[userId]?.transport === Transports.WEBRTC;
}

export function getMyUser() {
  const { connectionId, room } = getWorkspace();
  if (!connectionId) {
    return null;
  }

  return room?.users[connectionId];
}

export function getWorkspace() {
  return selectWorkspace(store.getState());
}
