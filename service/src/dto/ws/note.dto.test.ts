import { validate } from 'class-validator';
import { NoteOnDto, NoteOffDto } from './note.dto';


describe('NoteOnDto', () => {
  let dto: NoteOnDto;

  beforeEach(() => {
    dto = new NoteOnDto();
  });

  describe('valid note on messages', () => {
    it('should pass validation for valid MIDI note', async () => {
      dto.note = 60; // Middle C
      dto.velocity = 64; // Medium velocity
      dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for minimum MIDI values', async () => {
      dto.note = 0;
      dto.velocity = 0;
      dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for maximum MIDI values', async () => {
      dto.note = 127;
      dto.velocity = 127;
      dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for multiple target users', async () => {
      dto.note = 60;
      dto.velocity = 64;
      dto.targetUserIds = [
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001'
      ];
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with maximum allowed target users', async () => {
      dto.note = 60;
      dto.velocity = 64;
      dto.targetUserIds = Array(50).fill(0).map((_, i) => {
        const index = i.toString().padStart(8, '0');
        return `550e8400-e29b-41d4-a716-${index}0000`;
      });
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('invalid note on messages', () => {
    describe('note validation', () => {
      it('should fail validation for note below MIDI range', async () => {
        dto.note = -1;
        dto.velocity = 64;
        dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0]?.constraints?.min).toBeDefined();
      });

      it('should fail validation for note above MIDI range', async () => {
        dto.note = 128;
        dto.velocity = 64;
        dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0]?.constraints?.max).toBeDefined();
      });

      it('should fail validation for non-number note', async () => {
        dto.note = 'C4' as any;
        dto.velocity = 64;
        dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0]?.constraints?.isNumber).toBeDefined();
      });
    });

    describe('velocity validation', () => {
      it('should fail validation for negative velocity', async () => {
        dto.note = 60;
        dto.velocity = -1;
        dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0]?.constraints?.min).toBeDefined();
      });

      it('should fail validation for velocity above MIDI range', async () => {
        dto.note = 60;
        dto.velocity = 128;
        dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0]?.constraints?.max).toBeDefined();
      });

      it('should fail validation for non-number velocity', async () => {
        dto.note = 60;
        dto.velocity = 'loud' as any;
        dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0]?.constraints?.isNumber).toBeDefined();
      });
    });

    describe('targetUserIds validation', () => {
      it('should fail validation for non-array targetUserIds', async () => {
        dto.note = 60;
        dto.velocity = 64;
        dto.targetUserIds = 'not-an-array' as any;
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0]?.constraints?.isArray).toBeDefined();
      });

      it('should fail validation for invalid UUID in array', async () => {
        dto.note = 60;
        dto.velocity = 64;
        dto.targetUserIds = ['invalid-uuid'];
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0]?.constraints?.isUuid).toContain('each value in targetUserIds must be a UUID');
      });

      it('should fail validation for too many target users', async () => {
        dto.note = 60;
        dto.velocity = 64;
        dto.targetUserIds = Array(51).fill(0).map((_, i) => {
          const index = i.toString().padStart(8, '0');
          return `550e8400-e29b-41d4-a716-${index}0000`;
        });
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0]?.constraints?.arrayMaxSize).toBeDefined();
      });

      it('should fail validation for mixed valid and invalid UUIDs', async () => {
        dto.note = 60;
        dto.velocity = 64;
        dto.targetUserIds = [
          '550e8400-e29b-41d4-a716-446655440000',
          'invalid-uuid'
        ];
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0]?.constraints?.isUuid).toContain('each value in targetUserIds must be a UUID');
      });
    });
  });
});

describe('NoteOffDto', () => {
  let dto: NoteOffDto;

  beforeEach(() => {
    dto = new NoteOffDto();
  });

  describe('valid note off messages', () => {
    it('should pass validation for valid MIDI note', async () => {
      dto.note = 60;
      dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for minimum MIDI note', async () => {
      dto.note = 0;
      dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for maximum MIDI note', async () => {
      dto.note = 127;
      dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('invalid note off messages', () => {
    it('should fail validation for note below MIDI range', async () => {
      dto.note = -1;
      dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.min).toBeDefined();
    });

    it('should fail validation for note above MIDI range', async () => {
      dto.note = 128;
      dto.targetUserIds = ['550e8400-e29b-41d4-a716-446655440000'];
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.max).toBeDefined();
    });

    it('should fail validation for invalid targetUserIds', async () => {
      dto.note = 60;
      dto.targetUserIds = ['invalid-uuid'];
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isUuid).toContain('each value in targetUserIds must be a UUID');
    });
  });
});
