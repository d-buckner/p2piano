import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setStore } from '../app/store';
import { getRoom } from '../clients/RoomClient';
import { Transport } from '../constants';
import ClientPreferences from '../lib/ClientPreferences';
import * as EventCoordinator from '../lib/EventCoordinator';
import WebRtcController from '../networking/transports/WebRtcController';
import WebsocketController from '../networking/transports/WebsocketController';
import * as workspaceSelectors from '../selectors/workspaceSelectors';
import {
  joinRoom,
  updateDisplayName,
  updateInstrument,
  destroyRoom,
} from './WorkspaceActions';
import type { Room } from '../lib/workspaceTypes';
import type { Message } from '../networking/AbstractNetworkController';

// Mock all dependencies
vi.mock('../app/store', () => ({
  setStore: vi.fn(),
  store: {},
}));

vi.mock('../clients/RoomClient');
vi.mock('../lib/ClientPreferences');
vi.mock('../lib/EventCoordinator');
vi.mock('../networking/transports/WebRtcController');
vi.mock('../networking/transports/WebsocketController');
vi.mock('../selectors/workspaceSelectors');

type MockWebsocketController = {
  broadcast: vi.Mock<[action: string, message: Message], void>;
  sendToPeer: vi.Mock<[peerId: string, action: string, message: Message], void>;
  destroy: vi.Mock<[], void>;
};

describe('WorkspaceActions', () => {
  let mockWebsocketController: MockWebsocketController;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock WebsocketController instance
    mockWebsocketController = {
      broadcast: vi.fn(),
    };
    vi.mocked(WebsocketController.getInstance).mockReturnValue(mockWebsocketController);
    
    // Default mock implementations
    vi.mocked(workspaceSelectors.selectWorkspace).mockReturnValue({
      room: null,
      userId: undefined,
      roomId: undefined,
      isValid: undefined,
      isLoading: undefined,
    });
    
    vi.mocked(workspaceSelectors.selectMyUser).mockReturnValue({
      userId: 'current-user',
      displayName: 'Current User',
      instrument: 'piano',
    });
  });

  describe('joinRoom', () => {
    it('should successfully join a new room', async () => {
      const mockRoom: Room = {
        roomId: 'room-123',
        name: 'Test Room',
        users: {
          'user-1': {
            userId: 'user-1',
            displayName: 'User One',
            instrument: 'piano',
          },
          'user-2': {
            userId: 'user-2',
            displayName: 'User Two',
            instrument: 'guitar',
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getRoom).mockResolvedValue(mockRoom);

      await joinRoom('room-123');

      // Should set roomId and loading state
      expect(setStore).toHaveBeenCalledWith('workspace', 'roomId', 'room-123');
      expect(setStore).toHaveBeenCalledWith('workspace', 'isLoading', true);
      
      // Should set the room data
      expect(setStore).toHaveBeenCalledWith('workspace', 'room', mockRoom);
      
      // Should add peer connections for each user
      expect(setStore).toHaveBeenCalledWith('connection', 'peerConnections', 'user-1', {
        latency: 0,
        transport: Transport.WEBSOCKET,
      });
      expect(setStore).toHaveBeenCalledWith('connection', 'peerConnections', 'user-2', {
        latency: 0,
        transport: Transport.WEBSOCKET,
      });
      
      // Should set valid state and stop loading
      expect(setStore).toHaveBeenCalledWith('workspace', 'isValid', true);
      expect(setStore).toHaveBeenCalledWith('workspace', 'isLoading', false);
      
      // Should register event coordinator
      expect(EventCoordinator.register).toHaveBeenCalled();
    });

    it('should handle room already in store', async () => {
      const existingRoom: Room = {
        roomId: 'existing-room',
        name: 'Existing Room',
        users: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(workspaceSelectors.selectWorkspace).mockReturnValue({
        room: existingRoom,
        userId: 'user-123',
        roomId: 'existing-room',
        isValid: true,
        isLoading: false,
      });

      await joinRoom('existing-room');

      // Should not call getRoom if room already exists
      expect(getRoom).not.toHaveBeenCalled();
      
      // Should still set loading states
      expect(setStore).toHaveBeenCalledWith('workspace', 'roomId', 'existing-room');
      expect(setStore).toHaveBeenCalledWith('workspace', 'isLoading', true);
      expect(setStore).toHaveBeenCalledWith('workspace', 'isValid', true);
      expect(setStore).toHaveBeenCalledWith('workspace', 'isLoading', false);
      
      // Should register event coordinator
      expect(EventCoordinator.register).toHaveBeenCalled();
    });

    it('should handle room with no users', async () => {
      const emptyRoom: Room = {
        roomId: 'empty-room',
        name: 'Empty Room',
        users: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getRoom).mockResolvedValue(emptyRoom);

      await joinRoom('empty-room');

      expect(setStore).toHaveBeenCalledWith('workspace', 'room', emptyRoom);
      expect(setStore).toHaveBeenCalledWith('workspace', 'isValid', true);
      expect(EventCoordinator.register).toHaveBeenCalled();
    });

    it('should handle room with undefined users', async () => {
      const roomWithUndefinedUsers: Room = {
        roomId: 'undefined-users-room',
        name: 'Room with undefined users',
        users: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getRoom).mockResolvedValue(roomWithUndefinedUsers);

      await joinRoom('undefined-users-room');

      expect(setStore).toHaveBeenCalledWith('workspace', 'room', roomWithUndefinedUsers);
      expect(setStore).toHaveBeenCalledWith('workspace', 'isValid', true);
      // Should not try to add peer connections for undefined users
      expect(EventCoordinator.register).toHaveBeenCalled();
    });

    it('should handle getRoom failure', async () => {
      vi.mocked(getRoom).mockRejectedValue(new Error('Room not found'));

      await joinRoom('nonexistent-room');

      expect(setStore).toHaveBeenCalledWith('workspace', 'roomId', 'nonexistent-room');
      expect(setStore).toHaveBeenCalledWith('workspace', 'isLoading', true);
      
      // Should mark as invalid
      expect(setStore).toHaveBeenCalledWith('workspace', 'isValid', false);
      expect(setStore).toHaveBeenCalledWith('workspace', 'isLoading', false);
      
      // Should not register event coordinator
      expect(EventCoordinator.register).not.toHaveBeenCalled();
    });

    it('should handle network timeout gracefully', async () => {
      vi.mocked(getRoom).mockRejectedValue(new Error('Network timeout'));

      await joinRoom('timeout-room');

      expect(setStore).toHaveBeenCalledWith('workspace', 'isValid', false);
      expect(EventCoordinator.register).not.toHaveBeenCalled();
    });

    it('should add peer connections for multiple users correctly', async () => {
      const roomWithManyUsers: Room = {
        roomId: 'crowded-room',
        name: 'Crowded Room',
        users: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add multiple users
      for (let i = 1; i <= 5; i++) {
        roomWithManyUsers.users![`user-${i}`] = {
          userId: `user-${i}`,
          displayName: `User ${i}`,
          instrument: i % 2 === 0 ? 'guitar' : 'piano',
        };
      }

      vi.mocked(getRoom).mockResolvedValue(roomWithManyUsers);

      await joinRoom('crowded-room');

      // Should add peer connection for each user
      for (let i = 1; i <= 5; i++) {
        expect(setStore).toHaveBeenCalledWith('connection', 'peerConnections', `user-${i}`, {
          latency: 0,
          transport: Transport.WEBSOCKET,
        });
      }
    });
  });

  describe('updateDisplayName', () => {
    it('should update display name when user exists', () => {
      const currentUser = {
        userId: 'user-123',
        displayName: 'Old Name',
        instrument: 'piano' as const,
      };

      vi.mocked(workspaceSelectors.selectMyUser).mockReturnValue(currentUser);

      updateDisplayName('New Display Name');

      expect(ClientPreferences.setDisplayName).toHaveBeenCalledWith('New Display Name');
      expect(mockWebsocketController.broadcast).toHaveBeenCalledWith('USER_UPDATE', {
        userId: 'user-123',
        displayName: 'New Display Name',
        instrument: 'piano',
      });
    });

    it('should handle empty display name', () => {
      const currentUser = {
        userId: 'user-123',
        displayName: 'Current Name',
        instrument: 'guitar' as const,
      };

      vi.mocked(workspaceSelectors.selectMyUser).mockReturnValue(currentUser);

      updateDisplayName('');

      expect(ClientPreferences.setDisplayName).toHaveBeenCalledWith('');
      expect(mockWebsocketController.broadcast).toHaveBeenCalledWith('USER_UPDATE', {
        userId: 'user-123',
        displayName: '',
        instrument: 'guitar',
      });
    });

    it('should handle special characters in display name', () => {
      const currentUser = {
        userId: 'user-123',
        displayName: 'Current Name',
        instrument: 'piano' as const,
      };

      vi.mocked(workspaceSelectors.selectMyUser).mockReturnValue(currentUser);

      updateDisplayName('🎵 Müsic Löver! 🎹');

      expect(ClientPreferences.setDisplayName).toHaveBeenCalledWith('🎵 Müsic Löver! 🎹');
      expect(mockWebsocketController.broadcast).toHaveBeenCalledWith('USER_UPDATE', {
        userId: 'user-123',
        displayName: '🎵 Müsic Löver! 🎹',
        instrument: 'piano',
      });
    });

    it('should not update when user does not exist', () => {
      vi.mocked(workspaceSelectors.selectMyUser).mockReturnValue(null);

      updateDisplayName('New Name');

      expect(ClientPreferences.setDisplayName).not.toHaveBeenCalled();
      expect(mockWebsocketController.broadcast).not.toHaveBeenCalled();
    });

    it('should not update when user is undefined', () => {
      vi.mocked(workspaceSelectors.selectMyUser).mockReturnValue(undefined);

      updateDisplayName('New Name');

      expect(ClientPreferences.setDisplayName).not.toHaveBeenCalled();
      expect(mockWebsocketController.broadcast).not.toHaveBeenCalled();
    });
  });

  describe('updateInstrument', () => {
    it('should update instrument when user exists', () => {
      const currentUser = {
        userId: 'user-456',
        displayName: 'Test User',
        instrument: 'piano' as const,
      };

      vi.mocked(workspaceSelectors.selectMyUser).mockReturnValue(currentUser);

      updateInstrument('guitar');

      expect(mockWebsocketController.broadcast).toHaveBeenCalledWith('USER_UPDATE', {
        userId: 'user-456',
        displayName: 'Test User',
        instrument: 'guitar',
      });
    });


    it('should not update when user does not exist', () => {
      vi.mocked(workspaceSelectors.selectMyUser).mockReturnValue(null);

      updateInstrument('guitar');

      expect(mockWebsocketController.broadcast).not.toHaveBeenCalled();
    });

    it('should preserve other user properties when updating instrument', () => {
      const currentUser = {
        userId: 'preserve-test',
        displayName: 'Preserve Test User',
        instrument: 'piano' as const,
        customProperty: 'should be preserved',
      };

      vi.mocked(workspaceSelectors.selectMyUser).mockReturnValue(currentUser);

      updateInstrument('electric-bass');

      expect(mockWebsocketController.broadcast).toHaveBeenCalledWith('USER_UPDATE', {
        userId: 'preserve-test',
        displayName: 'Preserve Test User',
        instrument: 'electric-bass',
        customProperty: 'should be preserved',
      });
    });
  });

  describe('destroyRoom', () => {
    it('should clean up all resources and reset state', () => {
      destroyRoom();

      // Should destroy all controllers and coordinators
      expect(EventCoordinator.destroy).toHaveBeenCalled();
      expect(WebRtcController.destroy).toHaveBeenCalled();
      expect(WebsocketController.destroy).toHaveBeenCalled();

      // Should reset workspace state
      expect(setStore).toHaveBeenCalledWith('workspace', {
        roomId: undefined,
        userId: undefined,
        isValid: undefined,
        isLoading: undefined,
        room: undefined,
      });
    });

    it('should handle multiple destroy calls gracefully', () => {
      destroyRoom();
      destroyRoom();
      destroyRoom();

      // Each call should attempt cleanup
      expect(EventCoordinator.destroy).toHaveBeenCalledTimes(3);
      expect(WebRtcController.destroy).toHaveBeenCalledTimes(3);
      expect(WebsocketController.destroy).toHaveBeenCalledTimes(3);
      expect(setStore).toHaveBeenCalledTimes(3);
    });

    it('should clean up state completely', () => {
      destroyRoom();

      const resetState = vi.mocked(setStore).mock.calls.find(
        call => call[0] === 'workspace' && typeof call[1] === 'object'
      )?.[1];

      expect(resetState).toEqual({
        roomId: undefined,
        userId: undefined,
        isValid: undefined,
        isLoading: undefined,
        room: undefined,
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete room lifecycle', async () => {
      const mockRoom: Room = {
        roomId: 'lifecycle-room',
        name: 'Lifecycle Test',
        users: {
          'user-1': {
            userId: 'user-1',
            displayName: 'User One',
            instrument: 'piano',
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getRoom).mockResolvedValue(mockRoom);
      vi.mocked(workspaceSelectors.selectMyUser).mockReturnValue({
        userId: 'user-1',
        displayName: 'User One',
        instrument: 'piano',
      });

      // Join room
      await joinRoom('lifecycle-room');

      // Update display name
      updateDisplayName('Updated User One');

      // Update instrument
      updateInstrument('guitar');

      // Leave room
      destroyRoom();

      // Verify the sequence
      expect(setStore).toHaveBeenCalledWith('workspace', 'roomId', 'lifecycle-room');
      expect(setStore).toHaveBeenCalledWith('workspace', 'room', mockRoom);
      expect(EventCoordinator.register).toHaveBeenCalled();
      expect(mockWebsocketController.broadcast).toHaveBeenCalledWith('USER_UPDATE', expect.objectContaining({
        displayName: 'Updated User One',
      }));
      expect(mockWebsocketController.broadcast).toHaveBeenCalledWith('USER_UPDATE', expect.objectContaining({
        instrument: 'guitar',
      }));
      expect(EventCoordinator.destroy).toHaveBeenCalled();
    });

    it('should broadcast user updates correctly during session', () => {
      const currentUser = {
        userId: 'session-user',
        displayName: 'Session User',
        instrument: 'piano' as const,
      };

      vi.mocked(workspaceSelectors.selectMyUser).mockReturnValue(currentUser);

      // Update display name - should broadcast with updated name
      updateDisplayName('Updated Name');
      expect(mockWebsocketController.broadcast).toHaveBeenCalledWith('USER_UPDATE', {
        userId: 'session-user',
        displayName: 'Updated Name',
        instrument: 'piano',
      });

      // Update instrument - should broadcast with updated instrument
      updateInstrument('guitar');
      expect(mockWebsocketController.broadcast).toHaveBeenCalledWith('USER_UPDATE', {
        userId: 'session-user',
        displayName: 'Session User', // Original display name since we mocked the selector
        instrument: 'guitar',
      });
    });

    it('should handle error conditions gracefully', async () => {
      // Test join room failure followed by successful operations
      vi.mocked(getRoom).mockRejectedValue(new Error('Network error'));

      await joinRoom('error-room');

      expect(setStore).toHaveBeenCalledWith('workspace', 'isValid', false);

      // Other operations should still work
      const validUser = {
        userId: 'valid-user',
        displayName: 'Valid User',
        instrument: 'piano' as const,
      };

      vi.mocked(workspaceSelectors.selectMyUser).mockReturnValue(validUser);

      updateDisplayName('New Name');
      expect(mockWebsocketController.broadcast).toHaveBeenCalled();

      destroyRoom();
      expect(EventCoordinator.destroy).toHaveBeenCalled();
    });
  });
});