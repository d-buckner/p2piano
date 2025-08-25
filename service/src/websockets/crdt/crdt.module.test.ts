import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { Crdt } from './crdt';
import { CrdtModule } from './crdt.module';
import type { TestingModule } from '@nestjs/testing';


describe('CrdtModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{
          name: 'default',
          ttl: 60000,
          limit: 500,
        }]),
        CrdtModule,
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have Crdt provider', () => {
    const crdt = module.get<Crdt>(Crdt);
    expect(crdt).toBeDefined();
  });
});

