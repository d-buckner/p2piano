import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { Notes } from './notes';
import { NotesModule } from './notes.module';


describe('NotesModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{
          name: 'default',
          ttl: 60000,
          limit: 500,
        }]),
        NotesModule,
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have Notes provider', () => {
    const notes = module.get<Notes>(Notes);
    expect(notes).toBeDefined();
  });
});

