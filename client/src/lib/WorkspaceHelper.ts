import store from '../app/store';
import { selectWorkspace } from '../slices/workspaceSlice';


export function getUsers() {
  const { room } = getWorkspace();
  return room?.users || {};
}

export function getUser(userId: string) {
  return getUsers()[userId];
}

export function getUserCount(): number {
  return Object(getUsers()).length;
}

export function getUsersArray() {
  return Object.values(getUsers());
}

export function getMyUser() {
  const { room } = getWorkspace();
  const userId = getMyUserId();
  if (userId === undefined) {
    return;
  }

  return room?.users?.[userId];
}

export function getMyUserId() {
  return getWorkspace().userId;
}

export function getWorkspace() {
  return selectWorkspace(store.getState());
}
