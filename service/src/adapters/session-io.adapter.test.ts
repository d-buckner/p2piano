import { vi } from 'vitest';
import { SessionValidatorService } from '../services/session-validator.service';
import { 
  createMockSessionWithId,
  createUUID 
} from '../test-utils/validation.helpers';
import { SessionIoAdapter } from './session-io.adapter';
import type { INestApplicationContext } from '@nestjs/common';


describe('SessionIoAdapter', () => {
  let adapter: SessionIoAdapter;
  let mockApp: INestApplicationContext;
  let mockSessionValidator: any;

  beforeEach(async () => {
    // Create mock session validator
    mockSessionValidator = {
      validateRawRequest: vi.fn(),
    };

    // Create mock application context
    mockApp = {
      get: vi.fn().mockReturnValue(mockSessionValidator),
    } as any;

    adapter = new SessionIoAdapter(mockApp);

    vi.clearAllMocks();
  });

  describe('createIOServer', () => {
    it('should create server with proper configuration', () => {
      const mockServer = { 
        on: vi.fn(), 
        use: vi.fn(),
        engine: { generateId: vi.fn() },
        adapter: vi.fn()
      };
      
      // Mock the parent's createIOServer method
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(adapter)), 'createIOServer')
        .mockReturnValue(mockServer);

      const options = {
        cors: {
          origin: 'http://localhost:3000',
          credentials: true
        },
        transports: ['websocket']
      } as any;

      const result = adapter.createIOServer(3000, options);

      expect(result).toBe(mockServer);
      expect(mockApp.get).toHaveBeenCalledWith(SessionValidatorService);
    });

    it('should configure allowRequest callback for session validation', async () => {
      const mockServer = { 
        on: vi.fn(), 
        use: vi.fn(),
        engine: { generateId: vi.fn() }
      };
      
      let capturedOptions: any;
      
      // Capture the options passed to parent createIOServer
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(adapter)), 'createIOServer')
        .mockImplementation((port, options) => {
          capturedOptions = options;
          return mockServer;
        });

      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      mockSessionValidator.validateRawRequest.mockResolvedValue(mockSession);

      const options = {
        cors: {
          origin: 'http://localhost:3000',
          credentials: true
        }
      } as any;

      adapter.createIOServer(3000, options);

      // Verify allowRequest was configured
      expect(capturedOptions.allowRequest).toBeDefined();
      expect(typeof capturedOptions.allowRequest).toBe('function');

      // Test allowRequest with valid session
      const mockRequest = {
        url: `/socket.io/?auth.sessionId=${sessionId}`,
        headers: {},
        socket: { remoteAddress: '127.0.0.1' }
      };
      
      const callback = vi.fn();
      await capturedOptions.allowRequest(mockRequest, callback);

      expect(mockSessionValidator.validateRawRequest).toHaveBeenCalledWith(mockRequest);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should reject connections without valid sessions', async () => {
      const mockServer = { 
        on: vi.fn(), 
        use: vi.fn(),
        engine: { generateId: vi.fn() }
      };
      
      let capturedOptions: any;
      
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(adapter)), 'createIOServer')
        .mockImplementation((port, options) => {
          capturedOptions = options;
          return mockServer;
        });

      mockSessionValidator.validateRawRequest.mockResolvedValue(null);

      adapter.createIOServer(3000, {} as any);

      // Test allowRequest with invalid session
      const mockRequest = {
        url: '/socket.io/',
        headers: {},
        socket: { remoteAddress: '192.168.1.1' }
      };
      
      const callback = vi.fn();
      await capturedOptions.allowRequest(mockRequest, callback);

      expect(mockSessionValidator.validateRawRequest).toHaveBeenCalledWith(mockRequest);
      expect(callback).toHaveBeenCalledWith(new Error('Session required'), false);
    });

    it('should handle session validation errors gracefully', async () => {
      const mockServer = { 
        on: vi.fn(), 
        use: vi.fn(),
        engine: { generateId: vi.fn() }
      };
      
      let capturedOptions: any;
      
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(adapter)), 'createIOServer')
        .mockImplementation((port, options) => {
          capturedOptions = options;
          return mockServer;
        });

      const error = new Error('Database connection failed');
      mockSessionValidator.validateRawRequest.mockRejectedValue(error);

      adapter.createIOServer(3000, {} as any);

      const mockRequest = {
        url: '/socket.io/?auth.sessionId=test-session',
        headers: {},
        socket: { remoteAddress: '192.168.1.1' }
      };
      
      const callback = vi.fn();
      await capturedOptions.allowRequest(mockRequest, callback);

      expect(callback).toHaveBeenCalledWith(new Error('Authentication error'), false);
    });

    it('should preserve original options while adding allowRequest', () => {
      const mockServer = { 
        on: vi.fn(), 
        use: vi.fn(),
        engine: { generateId: vi.fn() }
      };
      
      let capturedOptions: any;
      
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(adapter)), 'createIOServer')
        .mockImplementation((port, options) => {
          capturedOptions = options;
          return mockServer;
        });

      const originalOptions = {
        cors: {
          origin: 'http://localhost:3000',
          credentials: true
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000
      } as any;

      adapter.createIOServer(3000, originalOptions);

      // Verify original options are preserved (except transports which is forced to websocket-only)
      expect(capturedOptions.cors).toEqual(originalOptions.cors);
      expect(capturedOptions.transports).toEqual(['websocket']); // Adapter forces websocket-only transport
      expect(capturedOptions.pingTimeout).toBe(originalOptions.pingTimeout);
      
      // Verify allowRequest was added
      expect(capturedOptions.allowRequest).toBeDefined();
    });

    it('should work with minimal options', () => {
      const mockServer = { 
        on: vi.fn(), 
        use: vi.fn(),
        engine: { generateId: vi.fn() },
        adapter: vi.fn()
      };
      
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(adapter)), 'createIOServer')
        .mockReturnValue(mockServer);

      const result = adapter.createIOServer(3000);

      expect(result).toBe(mockServer);
      expect(mockApp.get).toHaveBeenCalledWith(SessionValidatorService);
    });
  });

  describe('Session Validation Integration', () => {
    it('should validate sessions consistently across different request types', async () => {
      const sessionId = createUUID();
      const mockSession = createMockSessionWithId({ sessionId });
      
      // Test different request formats
      const testCases = [
        {
          name: 'Query parameter session',
          request: {
            url: `/socket.io/?auth.sessionId=${sessionId}`,
            headers: {},
            socket: { remoteAddress: '127.0.0.1' }
          }
        },
        {
          name: 'Authorization header session',
          request: {
            url: '/socket.io/',
            headers: { authorization: `Bearer ${sessionId}` },
            socket: { remoteAddress: '127.0.0.1' }
          }
        },
        {
          name: 'Cookie session',
          request: {
            url: '/socket.io/',
            headers: { cookie: `sessionId=${sessionId}` },
            socket: { remoteAddress: '127.0.0.1' }
          }
        }
      ];

      const mockServer = { 
        on: vi.fn(), 
        use: vi.fn(),
        engine: { generateId: vi.fn() }
      };
      
      let capturedOptions: any;
      
      vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(adapter)), 'createIOServer')
        .mockImplementation((port, options) => {
          capturedOptions = options;
          return mockServer;
        });

      mockSessionValidator.validateRawRequest.mockResolvedValue(mockSession);

      adapter.createIOServer(3000, {} as any);

      // Test each request type
      for (const testCase of testCases) {
        const callback = vi.fn();
        
        await capturedOptions.allowRequest(testCase.request, callback);
        
        expect(mockSessionValidator.validateRawRequest).toHaveBeenCalledWith(testCase.request);
        expect(callback).toHaveBeenCalledWith(null, true);
        
        vi.clearAllMocks();
        mockSessionValidator.validateRawRequest.mockResolvedValue(mockSession);
      }
    });
  });
});
