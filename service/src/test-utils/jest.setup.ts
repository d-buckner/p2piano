// Jest setup file for common test configuration
import 'reflect-metadata';

// Mock the Database module to prevent actual database connections during tests
jest.mock('../clients/Database', () => ({
  default: {
    collection: jest.fn().mockReturnValue({
      insertOne: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      createIndex: jest.fn(),
    }),
  },
}));

// Mock MongoDB ObjectId
jest.mock('mongodb', () => ({
  ...jest.requireActual('mongodb'),
  ObjectId: jest.fn().mockImplementation(() => ({
    toString: () => '507f1f77bcf86cd799439011',
  })),
}));

// Mock crypto.randomUUID for deterministic tests
Object.defineProperty(global.crypto, 'randomUUID', {
  value: jest.fn().mockReturnValue('550e8400-e29b-41d4-a716-446655440000'),
  writable: true,
});

// Mock nanoid for deterministic room ID generation
jest.mock('nanoid', () => ({
  customAlphabet: jest.fn().mockReturnValue(() => 'abc23'),
}));

// Increase timeout for tests that might take longer
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  createValidUUID: () => '550e8400-e29b-41d4-a716-446655440000',
  createInvalidUUID: () => 'not-a-valid-uuid',
  createStringOfLength: (length: number, char = 'A') => char.repeat(length),
};

// Add custom matchers if needed
expect.extend({
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
});