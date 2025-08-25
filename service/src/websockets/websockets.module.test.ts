import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { CrdtModule } from './crdt/crdt.module';
import { NotesModule } from './notes/notes.module';
import { RoomModule } from './room/room.module';
import { SignalModule } from './signal/signal.module';
import { WebsocketsModule } from './websockets.module';
import type { TestingModule } from '@nestjs/testing';


describe('WebsocketsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: 'default',
            ttl: 60000,
            limit: 500,
          },
        ]),
        WebsocketsModule,
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have RoomModule imported', () => {
    expect(module.get(RoomModule)).toBeDefined();
  });

  it('should have SignalModule imported', () => {
    expect(module.get(SignalModule)).toBeDefined();
  });

  it('should have NotesModule imported', () => {
    expect(module.get(NotesModule)).toBeDefined();
  });

  it('should have CrdtModule imported', () => {
    expect(module.get(CrdtModule)).toBeDefined();
  });
});
