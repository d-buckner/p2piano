import { Injectable, Logger } from '@nestjs/common';
import Room from './entities/Room';


type RoomResponse = {
  roomId: string,
};

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async createRoom(): Promise<RoomResponse> {
    const startTime = Date.now();
    try {
      const result = await Room.create();
      const duration = Date.now() - startTime;
      this.logger.log(`Room created: ${result.roomId} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Failed to create room after ${duration}ms: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRoom(roomId: string): Promise<RoomResponse> {
    const startTime = Date.now();
    try {
      const room = new Room(roomId);
      const result = await room.get();
      const duration = Date.now() - startTime;
      this.logger.log(`Room retrieved: ${roomId} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Failed to get room ${roomId} after ${duration}ms: ${error.message}`, error.stack);
      throw error;
    }
  }
}
