import { describe, it, expect } from 'vitest';
import { InstrumentType } from '../audio/instruments/Instrument';
import { createTestRoom, createTestUser } from '../test-utils/testDataFactories';
import {
  selectWorkspace,
  selectRoom,
  selectUsers,
  selectMyUser,
  selectUserId,
  selectRoomId,
  selectIsLoading,
  selectIsValid,
  selectUser,
  selectUserCount,
  selectUsersArray,
} from './workspaceSelectors';
import type { RootState } from '../app/store';


const createMockState = (workspace: RootState['workspace']): RootState => ({
  notesByMidi: {},
  workspace,
  connection: {
    peerConnections: {},
    maxLatency: 0,
  },
});

describe('workspaceSelectors', () => {
  describe('selectWorkspace', () => {
    it('should return the entire workspace state', () => {
      const workspace = {
        room: createTestRoom(),
        userId: 'user123',
        roomId: 'room456',
        isLoading: false,
        isValid: true,
      };
      const state = createMockState(workspace);

      const result = selectWorkspace(state);

      expect(result).toBe(workspace);
    });
  });

  describe('selectRoom', () => {
    it('should return the room from workspace', () => {
      const room = createTestRoom();
      const workspace = { room, userId: null };
      const state = createMockState(workspace);

      const result = selectRoom(state);

      expect(result).toBe(room);
    });

    it('should return null when no room exists', () => {
      const workspace = { room: null, userId: null };
      const state = createMockState(workspace);

      const result = selectRoom(state);

      expect(result).toBeNull();
    });
  });

  describe('selectUsers', () => {
    it('should return users object from room', () => {
      const users = {
        user1: createTestUser({ userId: 'user1', instrument: InstrumentType.PIANO }),
        user2: createTestUser({ userId: 'user2', instrument: InstrumentType.SYNTH }),
      };
      const room = createTestRoom({ users });
      const workspace = { room, userId: null };
      const state = createMockState(workspace);

      const result = selectUsers(state);

      expect(result).toBe(users);
    });

    it('should return empty object when room has no users', () => {
      const room = createTestRoom({ users: undefined });
      const workspace = { room, userId: null };
      const state = createMockState(workspace);

      const result = selectUsers(state);

      expect(result).toEqual({});
    });

    it('should return empty object when no room exists', () => {
      const workspace = { room: null, userId: null };
      const state = createMockState(workspace);

      const result = selectUsers(state);

      expect(result).toEqual({});
    });
  });

  describe('selectMyUser', () => {
    it('should return current user when userId and room exist', () => {
      const currentUser = createTestUser({ userId: 'current-user' });
      const users = {
        'current-user': currentUser,
        'other-user': createTestUser({ userId: 'other-user' }),
      };
      const room = createTestRoom({ users });
      const workspace = { room, userId: 'current-user' };
      const state = createMockState(workspace);

      const result = selectMyUser(state);

      expect(result).toBe(currentUser);
    });

    it('should return undefined when userId is null', () => {
      const room = createTestRoom();
      const workspace = { room, userId: null };
      const state = createMockState(workspace);

      const result = selectMyUser(state);

      expect(result).toBeUndefined();
    });

    it('should return undefined when room is null', () => {
      const workspace = { room: null, userId: 'user123' };
      const state = createMockState(workspace);

      const result = selectMyUser(state);

      expect(result).toBeUndefined();
    });

    it('should return undefined when user not found in room', () => {
      const room = createTestRoom();
      const workspace = { room, userId: 'nonexistent-user' };
      const state = createMockState(workspace);

      const result = selectMyUser(state);

      expect(result).toBeUndefined();
    });
  });

  describe('selectUserId', () => {
    it('should return userId from workspace', () => {
      const workspace = { room: null, userId: 'user123' };
      const state = createMockState(workspace);

      const result = selectUserId(state);

      expect(result).toBe('user123');
    });

    it('should return null when userId is null', () => {
      const workspace = { room: null, userId: null };
      const state = createMockState(workspace);

      const result = selectUserId(state);

      expect(result).toBeNull();
    });
  });

  describe('selectRoomId', () => {
    it('should return roomId from workspace', () => {
      const workspace = { room: null, userId: null, roomId: 'room456' };
      const state = createMockState(workspace);

      const result = selectRoomId(state);

      expect(result).toBe('room456');
    });

    it('should return undefined when roomId is not set', () => {
      const workspace = { room: null, userId: null };
      const state = createMockState(workspace);

      const result = selectRoomId(state);

      expect(result).toBeUndefined();
    });
  });

  describe('selectIsLoading', () => {
    it('should return loading state', () => {
      const workspace = { room: null, userId: null, isLoading: true };
      const state = createMockState(workspace);

      const result = selectIsLoading(state);

      expect(result).toBe(true);
    });

    it('should return false when not loading', () => {
      const workspace = { room: null, userId: null, isLoading: false };
      const state = createMockState(workspace);

      const result = selectIsLoading(state);

      expect(result).toBe(false);
    });
  });

  describe('selectIsValid', () => {
    it('should return valid state', () => {
      const workspace = { room: null, userId: null, isValid: true };
      const state = createMockState(workspace);

      const result = selectIsValid(state);

      expect(result).toBe(true);
    });

    it('should return false when not valid', () => {
      const workspace = { room: null, userId: null, isValid: false };
      const state = createMockState(workspace);

      const result = selectIsValid(state);

      expect(result).toBe(false);
    });
  });

  describe('selectUser', () => {
    it('should return specific user by ID', () => {
      const targetUser = createTestUser({ userId: 'target-user' });
      const users = {
        'target-user': targetUser,
        'other-user': createTestUser({ userId: 'other-user' }),
      };
      const room = createTestRoom({ users });
      const workspace = { room, userId: null };
      const state = createMockState(workspace);

      const result = selectUser('target-user')(state);

      expect(result).toBe(targetUser);
    });

    it('should return undefined for non-existent user', () => {
      const room = createTestRoom();
      const workspace = { room, userId: null };
      const state = createMockState(workspace);

      const result = selectUser('nonexistent')(state);

      expect(result).toBeUndefined();
    });
  });

  describe('selectUserCount', () => {
    it('should return number of users in room', () => {
      const users = {
        user1: createTestUser({ userId: 'user1' }),
        user2: createTestUser({ userId: 'user2' }),
        user3: createTestUser({ userId: 'user3' }),
      };
      const room = createTestRoom({ users });
      const workspace = { room, userId: null };
      const state = createMockState(workspace);

      const result = selectUserCount(state);

      expect(result).toBe(3);
    });

    it('should return 0 when no users exist', () => {
      const room = createTestRoom({ users: {} });
      const workspace = { room, userId: null };
      const state = createMockState(workspace);

      const result = selectUserCount(state);

      expect(result).toBe(0);
    });

    it('should return 0 when no room exists', () => {
      const workspace = { room: null, userId: null };
      const state = createMockState(workspace);

      const result = selectUserCount(state);

      expect(result).toBe(0);
    });
  });

  describe('selectUsersArray', () => {
    it('should return array of users', () => {
      const user1 = createTestUser({ userId: 'user1' });
      const user2 = createTestUser({ userId: 'user2' });
      const users = { user1, user2 };
      const room = createTestRoom({ users });
      const workspace = { room, userId: null };
      const state = createMockState(workspace);

      const result = selectUsersArray(state);

      expect(result).toHaveLength(2);
      expect(result).toContain(user1);
      expect(result).toContain(user2);
    });

    it('should return empty array when no users exist', () => {
      const room = createTestRoom({ users: {} });
      const workspace = { room, userId: null };
      const state = createMockState(workspace);

      const result = selectUsersArray(state);

      expect(result).toEqual([]);
    });

    it('should return empty array when no room exists', () => {
      const workspace = { room: null, userId: null };
      const state = createMockState(workspace);

      const result = selectUsersArray(state);

      expect(result).toEqual([]);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workspace state correctly', () => {
      const currentUser = createTestUser({ 
        userId: 'current-user', 
        instrument: InstrumentType.PIANO,
        displayName: 'Piano Player',
      });
      const otherUser = createTestUser({ 
        userId: 'other-user', 
        instrument: InstrumentType.SYNTH,
        displayName: 'Synth Player',
      });
      
      const users = {
        'current-user': currentUser,
        'other-user': otherUser,
      };
      
      const room = createTestRoom({ 
        roomId: 'jam-session-123',
        users,
      });
      
      const workspace = {
        room,
        userId: 'current-user',
        roomId: 'jam-session-123',
        isLoading: false,
        isValid: true,
      };
      
      const state = createMockState(workspace);

      // Test all selectors work together
      expect(selectRoom(state)).toBe(room);
      expect(selectUserId(state)).toBe('current-user');
      expect(selectMyUser(state)).toBe(currentUser);
      expect(selectUserCount(state)).toBe(2);
      expect(selectUser('other-user')(state)).toBe(otherUser);
      expect(selectIsLoading(state)).toBe(false);
      expect(selectIsValid(state)).toBe(true);
    });
  });
});