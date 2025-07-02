import { vi, type Mock } from 'vitest';


export interface MockConfigProvider {
  getServiceUrl: Mock<[], string>;
}

export interface MockLogger {
  ERROR: Mock;
  WARN: Mock;
  INFO: Mock;
}

export interface MockClientPreferences {
  getDisplayName: Mock<[], string>;
}

export interface MockSocket {
  on: Mock;
  off: Mock;
  emit: Mock;
  disconnect: Mock;
}

export interface MockRealTimeController {
  broadcast: Mock;
  sendToPeer: Mock;
  on: Mock;
  off: Mock;
  getInstance: Mock;
  destroy: Mock;
}

export const createMockConfigProvider = (url = 'http://localhost:3001'): MockConfigProvider => ({
  getServiceUrl: vi.fn(() => url),
});

export const createMockLogger = (): MockLogger => ({
  ERROR: vi.fn(),
  WARN: vi.fn(),
  INFO: vi.fn(),
});

export const createMockStore = () => ({});

export const createMockClientPreferences = (): MockClientPreferences => ({
  getDisplayName: vi.fn(() => 'test-user'),
});

export const createMockSocket = (): MockSocket => ({
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
});

export const createMockRealTimeController = (): MockRealTimeController => ({
  broadcast: vi.fn(),
  sendToPeer: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  getInstance: vi.fn(),
  destroy: vi.fn(),
});