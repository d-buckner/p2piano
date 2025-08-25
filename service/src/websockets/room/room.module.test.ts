import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { Room } from './room';
import { RoomModule } from './room.module';


describe('RoomModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{
          name: 'default',
          ttl: 60000,
          limit: 500,
        }]),
        RoomModule,
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have Room provider', () => {
    const room = module.get<Room>(Room);
    expect(room).toBeDefined();
  });
});

