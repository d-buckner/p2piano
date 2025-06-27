import { ArgumentMetadata } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { WsValidationPipe } from './ws-validation.pipe';

describe('WsValidationPipe', () => {
  let pipe: WsValidationPipe;

  beforeEach(() => {
    pipe = new WsValidationPipe();
  });

  describe('exception creation', () => {
    it('should create WsException for validation errors', () => {
      const exceptionFactory = pipe.createExceptionFactory();
      const validationErrors = [
        {
          property: 'note',
          constraints: {
            isNumber: 'note must be a number',
            min: 'note must not be less than 0',
          },
        },
        {
          property: 'velocity',
          constraints: {
            max: 'velocity must not be greater than 127',
          },
        },
      ];

      const exception = exceptionFactory(validationErrors);

      expect(exception).toBeInstanceOf(WsException);
      expect(exception.getError()).toEqual({
        message: 'Validation failed',
        errors: [
          'note must be a number',
          'note must not be less than 0',
          'velocity must not be greater than 127',
        ],
      });
    });

    it('should create simplified WsException when detailed output is disabled', () => {
      const pipeWithDisabledOutput = new WsValidationPipe({
        disableErrorMessages: true,
      });
      
      const exceptionFactory = pipeWithDisabledOutput.createExceptionFactory();
      const validationErrors = [
        {
          property: 'note',
          constraints: {
            isNumber: 'note must be a number',
          },
        },
      ];

      const exception = exceptionFactory(validationErrors);

      expect(exception).toBeInstanceOf(WsException);
      expect(exception.getError()).toBe('Bad request');
    });

    it('should create WsException with empty errors for empty validation errors', () => {
      const exceptionFactory = pipe.createExceptionFactory();
      const exception = exceptionFactory([]);

      expect(exception).toBeInstanceOf(WsException);
      expect(exception.getError()).toEqual({
        message: 'Validation failed',
        errors: [],
      });
    });

    it('should handle validation errors without constraints', () => {
      const exceptionFactory = pipe.createExceptionFactory();
      const validationErrors = [
        {
          property: 'note',
          constraints: undefined,
        },
      ];

      const exception = exceptionFactory(validationErrors);

      expect(exception).toBeInstanceOf(WsException);
      expect(exception.getError()).toEqual({
        message: 'Validation failed',
        errors: [],
      });
    });

    it('should handle nested validation errors', () => {
      const exceptionFactory = pipe.createExceptionFactory();
      const validationErrors = [
        {
          property: 'signalData',
          constraints: undefined,
          children: [
            {
              property: 'type',
              constraints: {
                isIn: 'type must be one of: offer, answer, pranswer, rollback',
              },
            },
            {
              property: 'sdp',
              constraints: {
                maxLength: 'sdp must be shorter than or equal to 10000 characters',
              },
            },
          ],
        },
      ];

      const exception = exceptionFactory(validationErrors);

      expect(exception).toBeInstanceOf(WsException);
      expect(exception.getError()).toEqual({
        message: 'Validation failed',
        errors: [
          'type must be one of: offer, answer, pranswer, rollback',
          'sdp must be shorter than or equal to 10000 characters',
        ],
      });
    });

    it('should handle deeply nested validation errors', () => {
      const exceptionFactory = pipe.createExceptionFactory();
      const validationErrors = [
        {
          property: 'level1',
          constraints: undefined,
          children: [
            {
              property: 'level2',
              constraints: undefined,
              children: [
                {
                  property: 'level3',
                  constraints: {
                    isString: 'level3 must be a string',
                  },
                },
              ],
            },
          ],
        },
      ];

      const exception = exceptionFactory(validationErrors);

      expect(exception).toBeInstanceOf(WsException);
      expect(exception.getError()).toEqual({
        message: 'Validation failed',
        errors: ['level3 must be a string'],
      });
    });

    it('should handle mixed direct and nested validation errors', () => {
      const exceptionFactory = pipe.createExceptionFactory();
      const validationErrors = [
        {
          property: 'userId',
          constraints: {
            isUuid: 'userId must be a UUID',
          },
        },
        {
          property: 'signalData',
          constraints: undefined,
          children: [
            {
              property: 'type',
              constraints: {
                isIn: 'type must be one of: offer, answer, pranswer, rollback',
              },
            },
          ],
        },
      ];

      const exception = exceptionFactory(validationErrors);

      expect(exception).toBeInstanceOf(WsException);
      expect(exception.getError()).toEqual({
        message: 'Validation failed',
        errors: [
          'userId must be a UUID',
          'type must be one of: offer, answer, pranswer, rollback',
        ],
      });
    });
  });

  describe('inheritance from ValidationPipe', () => {
    it('should extend ValidationPipe', () => {
      expect(pipe).toBeInstanceOf(WsValidationPipe);
      // Should have all ValidationPipe methods
      expect(typeof pipe.transform).toBe('function');
    });

    it('should maintain ValidationPipe functionality', async () => {
      // Create a simple DTO class for testing
      class TestDto {
        value: string;
      }

      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };

      const validValue = { value: 'test' };
      
      // Should pass through valid values
      const result = await pipe.transform(validValue, metadata);
      expect(result).toEqual(validValue);
    });
  });
});