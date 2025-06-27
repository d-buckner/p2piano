import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RoomNotFoundError } from './errors';
import { Throttle } from '@nestjs/throttler';
import { RoomParamDto } from './dto/room-param.dto';
import { AutoSessionGuard } from './auth/auto-session.guard';



@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post('/api/room')
  @UseGuards(AutoSessionGuard)
  async createRoom() {
    const room = await this.appService.createRoom();
    return room;
  }

  @Throttle({ default: { limit: 30, ttl: 60 } })
  @Get('/api/room/:id')
  @UseGuards(AutoSessionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRoom(@Param() param: RoomParamDto) {
    const roomId = param.id;
    try {
      const room = await this.appService.getRoom(roomId);
      return room;
    } catch (err) {
      if (err instanceof RoomNotFoundError) {
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
      }
      throw err;
    }
  }



}
