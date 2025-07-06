import { Module } from '@nestjs/common';
import { Notes } from './notes';


@Module({
  providers: [Notes],
})
export class NotesModule { }
