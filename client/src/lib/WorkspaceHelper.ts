import store from '../app/store';
import { Transport } from '../constants';
import { selectWorkspace } from '../slices/workspaceSlice';

export function getUsers() {
  const { room } = getWorkspace();
  return room?.users || {};
}

export function getPeers() {
  const users = { ...getUsers() };
  delete users[getMyUserId()];
  return users;
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
  return room?.users[getMyUserId()];
}

export function getMyUserId() {
  const { connectionId: userId } = getWorkspace();
  if (!userId) {
    throw new Error('Unable to determine local user id');
  }
  return userId;
}

export function getWorkspace() {
  return selectWorkspace(store.getState());
}
