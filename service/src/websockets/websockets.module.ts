import { Module } from '@nestjs/common';
import { RoomModule } from './room/room.module';
import { SignalModule } from './signal/signal.module';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [RoomModule, SignalModule, NotesModule],
})
export class WebsocketsModule { }
