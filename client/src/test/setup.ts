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

// Mock IndexedDB for tests
const mockIndexedDB = {
  open: vi.fn(() => ({
    result: {},
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
  })),
};

Object.defineProperty(globalThis, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
});
