import { validate } from 'class-validator';
import { UserUpdateDto } from './user-update.dto';


describe('UserUpdateDto', () => {
  let dto: UserUpdateDto;

  beforeEach(() => {
    dto = new UserUpdateDto();
  });

  describe('valid user updates', () => {
    it('should pass validation for valid user update', async () => {
      dto.userId = '550e8400-e29b-41d4-a716-446655440000';
      dto.displayName = 'John Doe';
      dto.color = '#FF0000';
      dto.instrument = 'PIANO';
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for minimum length display name', async () => {
      dto.userId = '550e8400-e29b-41d4-a716-446655440000';
      dto.displayName = 'A';
      dto.color = '#FF0000';
      dto.instrument = 'PIANO';
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for maximum length display name', async () => {
      dto.userId = '550e8400-e29b-41d4-a716-446655440000';
      dto.displayName = 'A'.repeat(50);
      dto.color = '#FF0000';
      dto.instrument = 'PIANO';
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for short hex color code', async () => {
      dto.userId = '550e8400-e29b-41d4-a716-446655440000';
      dto.displayName = 'John';
      dto.color = '#f00';
      dto.instrument = 'PIANO';
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for SYNTH instrument', async () => {
      dto.userId = '550e8400-e29b-41d4-a716-446655440000';
      dto.displayName = 'John';
      dto.color = '#FF0000';
      dto.instrument = 'SYNTH';
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for ELECTRIC_BASS instrument', async () => {
      dto.userId = '550e8400-e29b-41d4-a716-446655440000';
      dto.displayName = 'John';
      dto.color = '#FF0000';
      dto.instrument = 'ELECTRIC_BASS';
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('invalid user updates', () => {
    describe('userId validation', () => {
      it('should fail validation for invalid UUID format', async () => {
        dto.userId = 'invalid-uuid';
        dto.displayName = 'John Doe';
        dto.color = '#FF0000';
        dto.instrument = 'PIANO';
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints?.isUuid).toBeDefined();
      });

      it('should fail validation for missing userId', async () => {
        dto.displayName = 'John Doe';
        dto.color = '#FF0000';
        dto.instrument = 'PIANO';
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints?.isUuid).toBeDefined();
      });
    });

    describe('displayName validation', () => {
      it('should fail validation for empty display name', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.displayName = '';
        dto.color = '#FF0000';
        dto.instrument = 'PIANO';
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints?.minLength).toBeDefined();
      });

      it('should fail validation for display name too long', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.displayName = 'A'.repeat(51);
        dto.color = '#FF0000';
        dto.instrument = 'PIANO';
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints?.maxLength).toBeDefined();
      });

      it('should fail validation for non-string display name', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.displayName = 123 as any;
        dto.color = '#FF0000';
        dto.instrument = 'PIANO';
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints?.isString).toBeDefined();
      });
    });

    describe('color validation', () => {
      it('should fail validation for invalid hex color format', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.displayName = 'John';
        dto.color = 'red';
        dto.instrument = 'PIANO';
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints?.matches).toBeDefined();
      });

      it('should fail validation for color without hash prefix', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.displayName = 'John';
        dto.color = 'FF0000';
        dto.instrument = 'PIANO';
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints?.matches).toBeDefined();
      });

      it('should fail validation for color with invalid length', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.displayName = 'John';
        dto.color = '#FFFFFFF';
        dto.instrument = 'PIANO';
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints?.matches).toBeDefined();
      });
    });

    describe('instrument validation', () => {
      it('should fail validation for invalid instrument', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.displayName = 'John';
        dto.color = '#FF0000';
        dto.instrument = 'GUITAR';
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints?.isIn).toBeDefined();
      });

      it('should fail validation for non-string instrument', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.displayName = 'John';
        dto.color = '#FF0000';
        dto.instrument = 123 as any;
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints?.isString).toBeDefined();
      });
    });
  });
});
