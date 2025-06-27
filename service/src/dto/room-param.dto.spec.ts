import { validate } from 'class-validator';
import { RoomParamDto } from './room-param.dto';

describe('RoomParamDto', () => {
  let dto: RoomParamDto;

  beforeEach(() => {
    dto = new RoomParamDto();
  });

  describe('valid room IDs', () => {
    it('should pass validation for valid 5-character lowercase alphanumeric ID', async () => {
      dto.id = 'abc23';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for all lowercase letters', async () => {
      dto.id = 'abcde';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for mixed letters and numbers', async () => {
      dto.id = 'a2b3c';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for all numbers', async () => {
      dto.id = '23456';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('invalid room IDs', () => {
    it('should fail validation for uppercase letters', async () => {
      dto.id = 'ABC23';
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.matches).toContain('Room ID must be 5 lowercase characters from allowed alphabet');
    });

    it('should fail validation for too short ID', async () => {
      dto.id = 'AB23';
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isLength).toBeDefined();
    });

    it('should fail validation for too long ID', async () => {
      dto.id = 'abc234';
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isLength).toBeDefined();
    });

    it('should fail validation for special characters', async () => {
      dto.id = 'abc@#';
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.matches).toContain('Room ID must be 5 lowercase characters from allowed alphabet');
    });

    it('should fail validation for numbers 0 and 1 (excluded from alphabet)', async () => {
      dto.id = 'abc01';
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.matches).toContain('Room ID must be 5 lowercase characters from allowed alphabet');
    });

    it('should fail validation for confusing letters (i, l, o)', async () => {
      dto.id = 'abcil';
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.matches).toContain('Room ID must be 5 lowercase characters from allowed alphabet');
    });

    it('should fail validation for empty string', async () => {
      dto.id = '';
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isLength).toBeDefined();
    });

    it('should fail validation for null/undefined', async () => {
      dto.id = null as any;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for non-string type', async () => {
      dto.id = 12345 as any;
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBeDefined();
    });
  });
});