import { customAlphabet } from 'nanoid';
import { getNextColor } from '../utils/ColorUtils';
import Database from '../clients/Database';
import { RoomNotFoundError } from '../errors';

import type { Room as IRoom, User } from '../utils/workspaceTypes';

const generateRoomId = customAlphabet('abcdefghjkmnpqrstuvwxyz', 5);
const RoomCollection = Database.collection<IRoom>('room');
RoomCollection.createIndex({ roomId: 1 });
// Room lasts for 1.5 hours
RoomCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 5400 });


export default class Room {
  declare readonly roomId: string;

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  static async create() {
    const roomId = generateRoomId();
    await RoomCollection.insertOne({
      roomId,
      users: {},
      createdAt: new Date(),
    });
    return new Room(roomId);
  }

  async get(): Promise<IRoom> {
    const room = await RoomCollection.findOne({ roomId: this.roomId });
    if (!room) {
      throw new RoomNotFoundError(`Room ${this.roomId} does not exist`);
    }

    return room;
  }

  async join(userId: string, displayName: string) {
    const room = await this.get();
    const { users } = room;

    if (users[userId]) {
      return room;
    }

    const usedColors = Object.values(users).map(u => u.color);

    users[userId] = {
      userId,
      displayName,
      color: getNextColor(usedColors),
      instrument: 'PIANO',
    };

    await RoomCollection.updateOne(
      { roomId: this.roomId },
      {
        $set: {
          users,
        },
      }
    );

    return room;
  }

  async updateUser(user: User) {
    const room = await this.get();
    room.users[user.userId] = user;
    await RoomCollection.updateOne(
      { roomId: this.roomId },
      {
        $set: {
          users: room.users,
        },
      }
    );

    return room;
  }

  async leave(userId: string) {
    const room = await this.get();
    delete room.users[userId];
    await RoomCollection.updateOne(
      { roomId: this.roomId },
      {
        $set: {
          users: room.users,
        },
      }
    );
    return room;
  }
}
