import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global callback queue for requestIdleCallback mock - accessible in tests
export const mockIdleCallbacks: Array<() => void> = [];

// Mock ponyfill globally for all tests
vi.mock('../lib/ponyfill', () => ({
  requestIdleCallback: vi.fn((callback: () => void) => {
    mockIdleCallbacks.push(callback);
    return mockIdleCallbacks.length;
  }),
}));
