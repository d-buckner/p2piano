import { Module } from '@nestjs/common';
import { CrdtModule } from './crdt/crdt.module';
import { NotesModule } from './notes/notes.module';
import { RoomModule } from './room/room.module';
import { SignalModule } from './signal/signal.module';


@Module({
  imports: [RoomModule, SignalModule, NotesModule, CrdtModule],
})
export class WebsocketsModule { }
