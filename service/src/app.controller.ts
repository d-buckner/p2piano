import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RoomNotFoundError } from './errors';
import { Throttle } from '@nestjs/throttler';



@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Throttle({ default: { limit: 3, ttl: 15 } })
  @Post('/api/room')
  async createRoom() {
    const room = await this.appService.createRoom();
    return room;
  }

  @Throttle({ default: { limit: 10, ttl: 15 } })
  @Get('/api/room/:id')
  async getRoom(@Param() param) {
    const roomId = param.id;
    try {
      const room = await this.appService.getRoom(roomId);
      return room;
    } catch (err) {
      if (err instanceof RoomNotFoundError) {
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
      }
    }
  }

  @Throttle({ default: { limit: 4, ttl: 60 } })
  @Post('/api/session')
  async createSession() {
    return this.appService.createSession();
  }
}
