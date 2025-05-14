import store from '../app/store';
import { Transport } from '../constants';
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
  return connections[userId]?.transport === Transport.WEBRTC;
}

export function getMyUser() {
  const { room } = getWorkspace();
  const userId = getMyUserId();
  if (userId === undefined) {
    return;
  }

  return room?.users[userId];
}

export function getMyUserId() {
  return getWorkspace().connectionId;
}

export function getWorkspace() {
  return selectWorkspace(store.getState());
}
