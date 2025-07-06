import { Test } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AppService } from './app.service';
import type { TestingModule } from '@nestjs/testing';

// Hoist the mock functions
const mockRoomCreate = vi.hoisted(() => vi.fn());
const mockRoomGet = vi.hoisted(() => vi.fn());

// Mock the Room entity
vi.mock('./entities/Room', () => ({
  default: class MockRoom {
    static create = mockRoomCreate;
    
    constructor(public roomId?: string) {}
    
    get = mockRoomGet;
  },
}));

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('createRoom', () => {
    it('should create a room successfully', async () => {
      const mockRoomResponse = { roomId: 'test-room-123' };
      mockRoomCreate.mockResolvedValue(mockRoomResponse);

      const result = await service.createRoom();

      expect(result).toEqual(mockRoomResponse);
      expect(mockRoomCreate).toHaveBeenCalledTimes(1);
    });

    it('should return the room response from Room.create', async () => {
      const expectedResponse = { roomId: 'unique-room-id' };
      mockRoomCreate.mockResolvedValue(expectedResponse);

      const result = await service.createRoom();

      expect(result).toBe(expectedResponse);
    });

    it('should propagate errors from Room.create', async () => {
      const mockError = new Error('Database connection failed');
      mockRoomCreate.mockRejectedValue(mockError);

      await expect(service.createRoom()).rejects.toThrow('Database connection failed');
    });

    it('should call Room.create without arguments', async () => {
      const mockRoomResponse = { roomId: 'test-room' };
      mockRoomCreate.mockResolvedValue(mockRoomResponse);

      await service.createRoom();

      expect(mockRoomCreate).toHaveBeenCalledWith();
    });
  });

  describe('getRoom', () => {
    it('should get a room successfully', async () => {
      const roomId = 'test-room-789';
      const mockRoomResponse = { roomId };
      mockRoomGet.mockResolvedValue(mockRoomResponse);

      const result = await service.getRoom(roomId);

      expect(result).toEqual(mockRoomResponse);
      expect(mockRoomGet).toHaveBeenCalledTimes(1);
    });

    it('should return the room response from room.get', async () => {
      const roomId = 'specific-room';
      const expectedResponse = { roomId };
      mockRoomGet.mockResolvedValue(expectedResponse);

      const result = await service.getRoom(roomId);

      expect(result).toBe(expectedResponse);
    });

    it('should propagate errors from room.get', async () => {
      const roomId = 'error-room';
      const mockError = new Error('Room not found');
      mockRoomGet.mockRejectedValue(mockError);

      await expect(service.getRoom(roomId)).rejects.toThrow('Room not found');
    });

    it('should call room.get without arguments', async () => {
      const roomId = 'test-room';
      const mockRoomResponse = { roomId };
      mockRoomGet.mockResolvedValue(mockRoomResponse);

      await service.getRoom(roomId);

      expect(mockRoomGet).toHaveBeenCalledWith();
    });
  });

  describe('integration behavior', () => {
    it('should handle different room IDs independently', async () => {
      const roomId1 = 'room-1';
      const roomId2 = 'room-2';
      const response1 = { roomId: roomId1 };
      const response2 = { roomId: roomId2 };
      
      mockRoomGet.mockResolvedValueOnce(response1).mockResolvedValueOnce(response2);

      const result1 = await service.getRoom(roomId1);
      const result2 = await service.getRoom(roomId2);

      expect(result1).toEqual(response1);
      expect(result2).toEqual(response2);
      expect(mockRoomGet).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed success and error scenarios', async () => {
      const successResponse = { roomId: 'success-room' };
      mockRoomCreate.mockResolvedValue(successResponse);
      
      const errorRoom = 'error-room';
      mockRoomGet.mockRejectedValue(new Error('Not found'));

      const createResult = await service.createRoom();
      expect(createResult).toEqual(successResponse);

      await expect(service.getRoom(errorRoom)).rejects.toThrow('Not found');
    });
  });
});
