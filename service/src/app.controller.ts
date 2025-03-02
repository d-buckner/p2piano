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

import type { FastifyReply } from 'fastify';

const ROOM_COOKIE_KEY = 'ROOM';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Throttle(3, 15)
  @Post('/api/room')
  async createRoom(@Res({ passthrough: true }) response: FastifyReply) {
    const room = await this.appService.createRoom();
    AppController.setRoomIdCookie(response, room.roomId);
    return room;
  }

  @Throttle(10, 15)
  @Get('/api/room/:id')
  async getRoom(@Param() param, @Res({ passthrough: true }) response: FastifyReply) {
    const roomId = param.id;
    try {
      const room = await this.appService.getRoom(roomId);
      AppController.setRoomIdCookie(response, roomId);
      return room;
    } catch (err) {
      if (err instanceof RoomNotFoundError) {
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
      }
    }
  }

  @Throttle(4, 60)
  @Post('/api/session')
  async createSession() {
    return this.appService.createSession();
  }

  private static setRoomIdCookie(response: FastifyReply, roomId: string) {
    AppController.setCookie(response, ROOM_COOKIE_KEY, roomId);
  }

  private static setCookie(response: FastifyReply, name: string, value: string) {
    response.setCookie(name, value, {
      path: '/',
    });
  }
}
