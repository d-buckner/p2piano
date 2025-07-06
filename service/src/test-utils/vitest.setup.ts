// Vitest setup file for common test configuration
import 'reflect-metadata';
import { vi } from 'vitest';

// Mock the Database module to prevent actual database connections during tests
vi.mock('../clients/Database', () => ({
  default: {
    collection: vi.fn().mockReturnValue({
      insertOne: vi.fn(),
      findOne: vi.fn(),
      updateOne: vi.fn(),
      deleteOne: vi.fn(),
      deleteMany: vi.fn(),
      createIndex: vi.fn(),
    }),
  },
}));

// Mock MongoDB ObjectId
vi.mock('mongodb', async () => {
  const actual = await vi.importActual('mongodb');
  return {
    ...actual,
    ObjectId: vi.fn().mockImplementation(() => ({
      toString: () => '507f1f77bcf86cd799439011',
    })),
  };
});

// Mock crypto.randomUUID for deterministic tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn().mockReturnValue('550e8400-e29b-41d4-a716-446655440000'),
  },
  writable: true,
});

// Mock nanoid for deterministic room ID generation
vi.mock('nanoid', () => ({
  customAlphabet: vi.fn().mockReturnValue(() => 'abc23'),
}));

// Global test utilities
globalThis.testUtils = {
  createUUID: () => '550e8400-e29b-41d4-a716-446655440000',
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
