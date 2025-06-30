import { validate, ValidationError } from 'class-validator';
import { ExecutionContext } from '@nestjs/common';
import { Session } from '../entities/Session';
import { Socket } from 'socket.io';
import { Request } from '../types/request';

interface MockSessionOptions extends Partial<Session> {}

interface MockWsClientOptions {
  handshake?: {
    auth: Record<string, any>;
    query: Record<string, any>;
    headers: Record<string, any>;
    time: string;
    address: string;
    xdomain: boolean;
    secure: boolean;
    issued: number;
    url: string;
  };
  disconnect?: jest.Mock;
  [key: string]: any;
}

interface MockHttpRequestOptions extends Partial<Request> {}

/**
 * Helper function to test validation with clear assertions
 */
export async function expectValidationErrors(
  dto: object,
  expectedErrorCount: number,
  expectedConstraints?: string[]
): Promise<ValidationError[]> {
  const errors = await validate(dto);
  
  expect(errors).toHaveLength(expectedErrorCount);
  
  if (expectedConstraints && expectedErrorCount > 0) {
    const actualConstraints = errors.flatMap(error => 
      Object.keys(error.constraints || {})
    );
    
    expectedConstraints.forEach(constraint => {
      expect(actualConstraints).toContain(constraint);
    });
  }
  
  return errors;
}

/**
 * Helper function to test successful validation
 */
export async function expectValidationSuccess(dto: object): Promise<void> {
  const errors = await validate(dto);
  expect(errors).toHaveLength(0);
}

/**
 * Helper to create valid UUID for testing
 */
export function createValidUUID(): string {
  return '550e8400-e29b-41d4-a716-446655440000';
}

/**
 * Helper to create multiple valid UUIDs for testing
 */
export function createValidUUIDs(count: number): string[] {
  return Array(count).fill(0).map((_, i) => 
    `550e8400-e29b-41d4-a716-44665544000${i.toString().padStart(1, '0')}`
  );
}

/**
 * Helper to create invalid UUID for testing
 */
export function createInvalidUUID(): string {
  return 'not-a-valid-uuid';
}

/**
 * Helper to create a string of specific length
 */
export function createStringOfLength(length: number, char = 'A'): string {
  return char.repeat(length);
}

/**
 * Helper to get constraint messages from validation errors
 */
export function getConstraintMessages(errors: ValidationError[]): string[] {
  return errors.flatMap(error => {
    const messages: string[] = [];
    
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }
    
    if (error.children) {
      messages.push(...getConstraintMessages(error.children));
    }
    
    return messages;
  });
}

/**
 * Helper to create mock session data
 */
export function createMockSession(overrides: MockSessionOptions = {}): Session {
  return {
    sessionId: createValidUUID(),
    createdAt: new Date(),
    lastActivity: new Date(),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Test)',
    ...overrides,
  };
}

/**
 * Helper to create mock WebSocket client
 */
export function createMockWsClient(overrides: MockWsClientOptions = {}): Partial<Socket> {
  return {
    handshake: {
      auth: {},
      query: {},
      headers: {},
      time: new Date().toISOString(),
      address: '127.0.0.1',
      xdomain: false,
      secure: false,
      issued: Date.now(),
      url: '/',
      ...overrides.handshake,
    },
    disconnect: jest.fn(),
    ...overrides,
  };
}

/**
 * Helper to create mock HTTP request
 */
export function createMockHttpRequest(overrides: MockHttpRequestOptions = {}): Partial<Request> {
  return {
    headers: {},
    cookies: {},
    query: {},
    ip: '192.168.1.1',
    ...overrides,
  };
}

/**
 * Helper to create mock execution context for HTTP
 */
export function createMockHttpExecutionContext(request: MockHttpRequestOptions = {}): Partial<ExecutionContext> {
  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: () => createMockHttpRequest(request),
    }),
  } as Partial<ExecutionContext>;
}

/**
 * Helper to create mock execution context for WebSocket
 */
export function createMockWsExecutionContext(client: MockWsClientOptions = {}): Partial<ExecutionContext> {
  return {
    switchToWs: jest.fn().mockReturnValue({
      getClient: () => createMockWsClient(client),
    }),
  } as Partial<ExecutionContext>;
}