import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SignalPayloadDto } from './signal.dto';

describe('SignalPayloadDto', () => {
  let dto: SignalPayloadDto;

  const createDto = (data: any): SignalPayloadDto => {
    return plainToClass(SignalPayloadDto, data);
  };

  describe('valid signal payloads', () => {
    it('should pass validation for valid offer signal', async () => {
      dto = createDto({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        signalData: {
          type: 'offer',
          sdp: 'v=0\r\no=- 123456789 123456789 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\n'
        }
      });
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for valid answer signal', async () => {
      dto.userId = '550e8400-e29b-41d4-a716-446655440000';
      dto.signalData = {
        type: 'answer',
        sdp: 'v=0\r\no=- 987654321 987654321 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\n'
      };
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for pranswer signal', async () => {
      dto.userId = '550e8400-e29b-41d4-a716-446655440000';
      dto.signalData = {
        type: 'pranswer',
        sdp: 'v=0\r\no=- 111111111 111111111 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\n'
      };
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for rollback signal', async () => {
      dto.userId = '550e8400-e29b-41d4-a716-446655440000';
      dto.signalData = {
        type: 'rollback',
        sdp: ''
      };
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for large but reasonable SDP', async () => {
      dto.userId = '550e8400-e29b-41d4-a716-446655440000';
      dto.signalData = {
        type: 'offer',
        sdp: 'v=0\r\n'.repeat(100) // Large but under 10KB limit
      };
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('invalid signal payloads', () => {
    describe('userId validation', () => {
      it('should fail validation for invalid UUID', async () => {
        dto.userId = 'not-a-uuid';
        dto.signalData = {
          type: 'offer',
          sdp: 'v=0\r\no=- 123456789 123456789 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\n'
        };
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints?.isUuid).toBeDefined();
      });

      it('should fail validation for missing userId', async () => {
        dto.signalData = {
          type: 'offer',
          sdp: 'v=0\r\no=- 123456789 123456789 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\n'
        };
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints?.isUuid).toBeDefined();
      });
    });

    describe('signalData validation', () => {
      it('should fail validation for invalid signal type', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.signalData = {
          type: 'invalid-type',
          sdp: 'v=0\r\no=- 123456789 123456789 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\n'
        };
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].children?.[0]?.constraints?.isIn).toBeDefined();
      });

      it('should fail validation for SDP too large', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.signalData = {
          type: 'offer',
          sdp: 'x'.repeat(10001) // Over 10KB limit
        };
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].children?.[0]?.constraints?.maxLength).toBeDefined();
      });

      it('should fail validation for non-string SDP', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.signalData = {
          type: 'offer',
          sdp: 12345 as any
        };
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].children?.[0]?.constraints?.isString).toBeDefined();
      });

      it('should fail validation for non-string type', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.signalData = {
          type: 123 as any,
          sdp: 'v=0\r\no=- 123456789 123456789 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\n'
        };
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].children?.[0]?.constraints?.isString).toBeDefined();
      });

      it('should fail validation for missing signalData properties', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.signalData = {
          type: 'offer'
          // Missing sdp
        } as any;
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].children?.length).toBeGreaterThan(0);
      });

      it('should fail validation for non-object signalData', async () => {
        dto.userId = '550e8400-e29b-41d4-a716-446655440000';
        dto.signalData = 'not-an-object' as any;
        
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints?.isObject).toBeDefined();
      });
    });
  });
});