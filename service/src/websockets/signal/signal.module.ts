import { Module } from '@nestjs/common';
import { Signal } from './signal';


@Module({
  providers: [Signal],
})
export class SignalModule { }
