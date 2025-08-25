import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { Signal } from './signal';
import { SignalModule } from './signal.module';


describe('SignalModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{
          name: 'default',
          ttl: 60000,
          limit: 500,
        }]),
        SignalModule,
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have Signal provider', () => {
    const signal = module.get<Signal>(Signal);
    expect(signal).toBeDefined();
  });
});

