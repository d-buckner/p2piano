import { setWorkspaceStore } from '../stores/WorkspaceStore';
import type { Room } from '../lib/workspaceTypes';


const Attributes = {
  ROOM: 'room',
  USER_ID: 'userId',
} as const;

export function setRoom(room: Room) {
  setWorkspaceStore(Attributes.ROOM, room);
}

export function setUserId(userId: string) {
  setWorkspaceStore(Attributes.USER_ID, userId);
}
