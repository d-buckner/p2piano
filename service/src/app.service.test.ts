import { Test } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AppService } from './app.service';
import Room from './entities/Room';
import { RoomNotFoundError } from './errors';
import type { TestingModule } from '@nestjs/testing';

// Mock the Room entity
vi.mock('./entities/Room');
const MockedRoom = vi.mocked(Room);

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
    vi.clearAllMocks();
  });

  describe('createRoom', () => {
    it('should call Room.create() and return the result', async () => {
      const mockResult = new Room('test-room-123');
      MockedRoom.create.mockResolvedValue(mockResult);

      const result = await service.createRoom();

      expect(MockedRoom.create).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResult);
    });

    it('should propagate errors from Room.create()', async () => {
      const mockError = new Error('Database connection failed');
      MockedRoom.create.mockRejectedValue(mockError);

      await expect(service.createRoom()).rejects.toThrow(mockError);
    });
  });

  describe('getRoom', () => {
    it('should create Room instance with correct ID and call get()', async () => {
      const roomId = 'test-room-456';
      const mockResult = { roomId };
      const mockRoomInstance = {
        roomId,
        get: vi.fn().mockResolvedValue(mockResult),
        join: vi.fn(),
        updateUser: vi.fn(),
        leave: vi.fn(),
      };
      MockedRoom.mockImplementation(() => mockRoomInstance as Room);

      const result = await service.getRoom(roomId);

      expect(MockedRoom).toHaveBeenCalledWith(roomId);
      expect(mockRoomInstance.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should propagate errors from room.get()', async () => {
      const roomId = 'nonexistent-room';
      const mockError = new RoomNotFoundError('Room not found');
      const mockRoomInstance = {
        roomId,
        get: vi.fn().mockRejectedValue(mockError),
        join: vi.fn(),
        updateUser: vi.fn(),
        leave: vi.fn(),
      };
      MockedRoom.mockImplementation(() => mockRoomInstance as Room);

      await expect(service.getRoom(roomId)).rejects.toThrow(mockError);
    });
  });
});
