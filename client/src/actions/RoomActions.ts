import { setStore } from '../app/store';
import type { Room } from '../lib/workspaceTypes';


export function setRoom(room: Room) {
  setStore('workspace', 'room', room);
}

export function setUserId(userId: string) {
  setStore('workspace', 'userId', userId);
}
