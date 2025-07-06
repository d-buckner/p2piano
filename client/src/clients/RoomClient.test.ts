import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConfigProvider from '../lib/ConfigProvider';
import { createNewRoom, getRoom } from './RoomClient';

// Mock dependencies
vi.mock('../lib/ConfigProvider', () => ({
  default: {
    getServiceUrl: vi.fn(() => 'http://localhost:3001'),
  },
}));

describe('RoomClient', () => {
  const mockFetch = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('createNewRoom', () => {
    it('should create new room with POST request', async () => {
      const mockRoom = { id: 'room123', users: {} };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockRoom),
      });

      const result = await createNewRoom();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/room', {
        method: 'POST',
        credentials: 'include',
      });
      expect(result).toEqual(mockRoom);
    });

    it('should throw error on failed room creation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(createNewRoom()).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('should include credentials for authentication', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });

      await createNewRoom();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });
  });

  describe('getRoom', () => {
    it('should fetch room by ID with GET request', async () => {
      const roomId = 'room123';
      const mockRoom = { 
        id: roomId, 
        users: { 
          user1: { userId: 'user1', displayName: 'Alice' }
        }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockRoom),
      });

      const result = await getRoom(roomId);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/room/room123', {
        credentials: 'include',
      });
      expect(result).toEqual(mockRoom);
    });

    it('should handle room not found error', async () => {
      const roomId = 'nonexistent';
      const errorResponse = {
        statusCode: 404,
        message: 'Room not found',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: vi.fn().mockResolvedValue(errorResponse),
      });

      await expect(getRoom(roomId)).rejects.toThrow('Room not found');
    });

    it('should handle server errors with custom message', async () => {
      const errorResponse = {
        statusCode: 500,
        message: 'Database connection failed',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: vi.fn().mockResolvedValue(errorResponse),
      });

      await expect(getRoom('room123')).rejects.toThrow('Database connection failed');
    });

    it('should handle errors without custom message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: vi.fn().mockResolvedValue({}),
      });

      await expect(getRoom('room123')).rejects.toThrow('HTTP 403: Forbidden');
    });

    it('should include credentials for authentication', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });

      await getRoom('room123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });
  });

  describe('URL construction', () => {
    it('should construct correct URLs for room endpoints', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });

      await createNewRoom();
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/room', expect.any(Object));

      await getRoom('test123');
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/room/test123', expect.any(Object));
    });

    it('should handle different service URLs', async () => {
      ConfigProvider.getServiceUrl.mockReturnValue('https://api.example.com');

      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });

      await getRoom('room456');

      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/room/room456', expect.any(Object));
    });
  });

  describe('network error handling', () => {
    it('should handle network failures', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(createNewRoom()).rejects.toThrow('Network error');
      await expect(getRoom('room123')).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      await expect(getRoom('room123')).rejects.toThrow('Invalid JSON');
    });
  });
});