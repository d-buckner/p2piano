import {Injectable} from '@nestjs/common';
import SessionProvider from './entities/Session';

import Room from './entities/Room';

type RoomResponse = {
  roomId: string,
};

@Injectable()
export class AppService {
  async createRoom(): Promise<RoomResponse> {
    return Room.create();
  }

  async getRoom(roomId: string): Promise<RoomResponse> {
    const room = new Room(roomId);
    return room.get()
  }

  createSession() {
    return SessionProvider.create();
  }

  getSession(sessionId: string) {
    return SessionProvider.get(sessionId);
  }
}
