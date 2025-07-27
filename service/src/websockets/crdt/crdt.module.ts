import { Module } from '@nestjs/common';
import { Crdt } from './crdt';


@Module({
  providers: [Crdt],
})
export class CrdtModule {}
