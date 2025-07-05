import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import getRoomId from './getRoomId';


describe('getRoomId', () => {
  let mockLocation: Partial<Location>;

  beforeEach(() => {
    mockLocation = {};
    vi.stubGlobal('location', mockLocation);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return room ID from pathname', () => {
    mockLocation.pathname = '/room-123';

    const result = getRoomId();

    expect(result).toBe('room-123');
  });

  it('should return empty string for root path', () => {
    mockLocation.pathname = '/';

    const result = getRoomId();

    expect(result).toBe('');
  });

  it('should handle complex room IDs', () => {
    mockLocation.pathname = '/my-complex-room-id-with-dashes';

    const result = getRoomId();

    expect(result).toBe('my-complex-room-id-with-dashes');
  });

  it('should handle UUID room IDs', () => {
    const roomId = '550e8400-e29b-41d4-a716-446655440000';
    mockLocation.pathname = `/${roomId}`;

    const result = getRoomId();

    expect(result).toBe(roomId);
  });
});