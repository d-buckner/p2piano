import { customAlphabet } from 'nanoid';
import Database from '../clients/Database';
import { RoomNotFoundError } from '../errors';
import { getNextColor } from '../utils/ColorUtils';
import type { Room as IRoom, User } from '../utils/workspaceTypes';


const generateRoomId = customAlphabet('abcdefghjkmnpqrstuvwxyz23456789', 5);
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
    const { users = {} } = room;

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
    // Optimized: Use findOneAndUpdate to update and return the result in one operation
    const updatedRoom = await RoomCollection.findOneAndUpdate(
      { roomId: this.roomId },
      {
        $set: {
          [`users.${user.userId}`]: user,
        },
      },
      { returnDocument: 'after' }
    );

    if (!updatedRoom) {
      throw new RoomNotFoundError(`Room ${this.roomId} does not exist`);
    }

    return updatedRoom;
  }

  async leave(userId: string) {
    // Optimized: Use findOneAndUpdate with $unset to remove user and return result in one operation
    const updatedRoom = await RoomCollection.findOneAndUpdate(
      { roomId: this.roomId },
      {
        $unset: {
          [`users.${userId}`]: '',
        },
      },
      { returnDocument: 'after' }
    );

    if (!updatedRoom) {
      throw new RoomNotFoundError(`Room ${this.roomId} does not exist`);
    }

    return updatedRoom;
  }
}
