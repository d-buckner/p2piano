import { Test } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AppService } from './app.service';
import Room from './entities/Room';
import type { TestingModule } from '@nestjs/testing';


// Mock the Room entity
vi.mock('./entities/Room', () => {
  const mockRoomInstance = {
    roomId: '',
    get: vi.fn(),
    join: vi.fn(),
    updateUser: vi.fn(),
    leave: vi.fn(),
  };
  
  return {
    default: vi.fn().mockImplementation((roomId) => {
      mockRoomInstance.roomId = roomId;
      return mockRoomInstance;
    }),
  };
});
const MockedRoom = vi.mocked(Room);

describe('AppService', () => {
  let service: AppService;
  let mockRoomInstance: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get fresh mock instance for each test
    mockRoomInstance = {
      roomId: '',
      get: vi.fn(),
      join: vi.fn(),
      updateUser: vi.fn(),
      leave: vi.fn(),
    };
    
    MockedRoom.mockImplementation((roomId) => {
      mockRoomInstance.roomId = roomId;
      return mockRoomInstance;
    });
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('createRoom', () => {
    it('should create a room successfully', async () => {
      const mockRoomResponse = { roomId: 'test-room-123' };
      MockedRoom.create = vi.fn().mockResolvedValue(mockRoomResponse);

      const result = await service.createRoom();

      expect(result).toEqual(mockRoomResponse);
      expect(MockedRoom.create).toHaveBeenCalledTimes(1);
    });

    it('should return the room response from Room.create', async () => {
      const expectedResponse = { roomId: 'unique-room-id' };
      MockedRoom.create = vi.fn().mockResolvedValue(expectedResponse);

      const result = await service.createRoom();

      expect(result).toBe(expectedResponse);
    });

    it('should propagate errors from Room.create', async () => {
      const mockError = new Error('Database connection failed');
      MockedRoom.create = vi.fn().mockRejectedValue(mockError);

      await expect(service.createRoom()).rejects.toThrow('Database connection failed');
    });

    it('should call Room.create without arguments', async () => {
      const mockRoomResponse = { roomId: 'test-room' };
      MockedRoom.create = vi.fn().mockResolvedValue(mockRoomResponse);

      await service.createRoom();

      expect(MockedRoom.create).toHaveBeenCalledWith();
    });
  });

  describe('getRoom', () => {
    it('should get a room successfully', async () => {
      const roomId = 'test-room-789';
      const mockRoomResponse = { roomId };
      mockRoomInstance.get.mockResolvedValue(mockRoomResponse);

      const result = await service.getRoom(roomId);

      expect(result).toEqual(mockRoomResponse);
      expect(MockedRoom).toHaveBeenCalledWith(roomId);
      expect(mockRoomInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should return the room response from room.get', async () => {
      const roomId = 'specific-room';
      const expectedResponse = { roomId };
      mockRoomInstance.get.mockResolvedValue(expectedResponse);

      const result = await service.getRoom(roomId);

      expect(result).toBe(expectedResponse);
    });

    it('should propagate errors from room.get', async () => {
      const roomId = 'error-room';
      const mockError = new Error('Room not found');
      mockRoomInstance.get.mockRejectedValue(mockError);

      await expect(service.getRoom(roomId)).rejects.toThrow('Room not found');
    });

    it('should call room.get without arguments', async () => {
      const roomId = 'test-room';
      const mockRoomResponse = { roomId };
      mockRoomInstance.get.mockResolvedValue(mockRoomResponse);

      await service.getRoom(roomId);

      expect(mockRoomInstance.get).toHaveBeenCalledWith();
    });
  });

  describe('integration behavior', () => {
    it('should handle different room IDs independently', async () => {
      const roomId1 = 'room-1';
      const roomId2 = 'room-2';
      const response1 = { roomId: roomId1 };
      const response2 = { roomId: roomId2 };
      
      mockRoomInstance.get.mockResolvedValueOnce(response1).mockResolvedValueOnce(response2);

      const result1 = await service.getRoom(roomId1);
      const result2 = await service.getRoom(roomId2);

      expect(result1).toEqual(response1);
      expect(result2).toEqual(response2);
      expect(mockRoomInstance.get).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed success and error scenarios', async () => {
      const successResponse = { roomId: 'success-room' };
      MockedRoom.create = vi.fn().mockResolvedValue(successResponse);
      
      const errorRoom = 'error-room';
      mockRoomInstance.get.mockRejectedValue(new Error('Not found'));

      const createResult = await service.createRoom();
      expect(createResult).toEqual(successResponse);

      await expect(service.getRoom(errorRoom)).rejects.toThrow('Not found');
    });
  });
});
