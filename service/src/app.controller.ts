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
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { AutoSessionGuard } from './auth/auto-session.guard';
import { RoomNotFoundError } from './errors';



@ApiTags('Rooms')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @ApiOperation({ 
    summary: 'Create a new room',
    description: 'Creates a new collaborative piano room with a unique ID' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Room created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Unique room identifier' },
        createdAt: { type: 'string', format: 'date-time' },
        users: { type: 'array', items: { type: 'object' } }
      }
    }
  })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiBearerAuth('session')
  @ApiCookieAuth('sessionId')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post('/api/room')
  @UseGuards(AutoSessionGuard)
  async createRoom() {
    const room = await this.appService.createRoom();
    return room;
  }

  @ApiOperation({ 
    summary: 'Get room details',
    description: 'Retrieves information about a specific room including connected users' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Room ID', 
    type: 'string',
    example: 'abc123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Room details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Room identifier' },
        users: { type: 'array', items: { type: 'object' } },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiBearerAuth('session')
  @ApiCookieAuth('sessionId')
  @Throttle({ default: { limit: 30, ttl: 60 } })
  @Get('/api/room/:id')
  @UseGuards(AutoSessionGuard)
  async getRoom(@Param('id') roomId: string) {
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
