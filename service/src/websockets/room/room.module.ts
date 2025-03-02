import { Module } from '@nestjs/common';
import { Room } from './room';

@Module({
  providers: [Room],
})
export class RoomModule { }
