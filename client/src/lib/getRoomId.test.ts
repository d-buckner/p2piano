import { describe, it, expect, beforeEach, vi } from 'vitest';
import getRoomId from './getRoomId';


describe('getRoomId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract room ID from pathname', () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      pathname: '/room123',
    } as Location);

    const roomId = getRoomId();
    expect(roomId).toBe('room123');
  });

  it('should handle root path', () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      pathname: '/',
    } as Location);

    const roomId = getRoomId();
    expect(roomId).toBe('');
  });

  it('should handle nested paths', () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      pathname: '/abc123/something',
    } as Location);

    const roomId = getRoomId();
    expect(roomId).toBe('abc123/something');
  });
});
