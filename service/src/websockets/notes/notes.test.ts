import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createUUID } from '../../test-utils/validation.helpers';
import { NoteEvents } from './events';
import { Notes } from './notes';

// Mock dependencies
vi.mock('../utils', () => ({
  broadcastToSubset: vi.fn(),
  getWebSocketGatewayOptions: () => {},
}));

describe('Notes WebSocket Gateway', () => {
  let notesGateway: Notes;
  let mockSocket: any;
  let mockBroadcastToSubset: any;

  beforeEach(async () => {
    // Mock Socket
    mockSocket = {
      id: 'socket-123',
      emit: vi.fn(),
      broadcast: {
        to: vi.fn().mockReturnThis(),
        emit: vi.fn(),
      },
      handshake: {
        address: '192.168.1.1',
        auth: {},
        query: {},
      },
    };

    // Mock utils
    const utils = await import('../utils');
    mockBroadcastToSubset = utils.broadcastToSubset as any;

    // Create gateway instance
    notesGateway = new Notes();

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Key down events', () => {
    it('should handle key down events and broadcast to target users', () => {
      const targetUserIds = [createUUID(), createUUID()];
      const payload = {
        note: 60, // Middle C
        velocity: 127,
        targetUserIds,
      };

      notesGateway.onKeyDown(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        targetUserIds,
        NoteEvents.KEY_DOWN,
        {
          note: payload.note,
          velocity: payload.velocity,
        }
      );
    });

    it('should handle key down with minimum velocity', () => {
      const targetUserIds = [createUUID()];
      const payload = {
        note: 21, // Lowest piano key
        velocity: 1,
        targetUserIds,
      };

      notesGateway.onKeyDown(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        targetUserIds,
        NoteEvents.KEY_DOWN,
        {
          note: 21,
          velocity: 1,
        }
      );
    });

    it('should handle key down with maximum velocity', () => {
      const targetUserIds = [createUUID()];
      const payload = {
        note: 108, // Highest piano key
        velocity: 127,
        targetUserIds,
      };

      notesGateway.onKeyDown(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        targetUserIds,
        NoteEvents.KEY_DOWN,
        {
          note: 108,
          velocity: 127,
        }
      );
    });

    it('should handle key down with empty target user list', () => {
      const payload = {
        note: 60,
        velocity: 64,
        targetUserIds: [],
      };

      notesGateway.onKeyDown(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        [],
        NoteEvents.KEY_DOWN,
        {
          note: 60,
          velocity: 64,
        }
      );
    });

    it('should handle key down with multiple target users', () => {
      const targetUserIds = [
        createUUID(),
        createUUID(),
        createUUID(),
        createUUID(),
      ];
      const payload = {
        note: 72, // C5
        velocity: 100,
        targetUserIds,
      };

      notesGateway.onKeyDown(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        targetUserIds,
        NoteEvents.KEY_DOWN,
        {
          note: 72,
          velocity: 100,
        }
      );
    });

    it('should handle key down with single target user', () => {
      const targetUserIds = [createUUID()];
      const payload = {
        note: 48, // C3
        velocity: 80,
        targetUserIds,
      };

      notesGateway.onKeyDown(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        targetUserIds,
        NoteEvents.KEY_DOWN,
        {
          note: 48,
          velocity: 80,
        }
      );
    });
  });

  describe('Key up events', () => {
    it('should handle key up events and broadcast to target users', () => {
      const targetUserIds = [createUUID(), createUUID()];
      const payload = {
        note: 60, // Middle C
        targetUserIds,
      };

      notesGateway.onKeyUp(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        targetUserIds,
        NoteEvents.KEY_UP,
        {
          note: payload.note,
        }
      );
    });

    it('should handle key up with minimum note value', () => {
      const targetUserIds = [createUUID()];
      const payload = {
        note: 21, // Lowest piano key
        targetUserIds,
      };

      notesGateway.onKeyUp(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        targetUserIds,
        NoteEvents.KEY_UP,
        {
          note: 21,
        }
      );
    });

    it('should handle key up with maximum note value', () => {
      const targetUserIds = [createUUID()];
      const payload = {
        note: 108, // Highest piano key
        targetUserIds,
      };

      notesGateway.onKeyUp(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        targetUserIds,
        NoteEvents.KEY_UP,
        {
          note: 108,
        }
      );
    });

    it('should handle key up with empty target user list', () => {
      const payload = {
        note: 60,
        targetUserIds: [],
      };

      notesGateway.onKeyUp(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        [],
        NoteEvents.KEY_UP,
        {
          note: 60,
        }
      );
    });

    it('should handle key up with multiple target users', () => {
      const targetUserIds = [
        createUUID(),
        createUUID(),
        createUUID(),
        createUUID(),
      ];
      const payload = {
        note: 84, // C6
        targetUserIds,
      };

      notesGateway.onKeyUp(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        targetUserIds,
        NoteEvents.KEY_UP,
        {
          note: 84,
        }
      );
    });

    it('should handle key up with single target user', () => {
      const targetUserIds = [createUUID()];
      const payload = {
        note: 36, // C2
        targetUserIds,
      };

      notesGateway.onKeyUp(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        targetUserIds,
        NoteEvents.KEY_UP,
        {
          note: 36,
        }
      );
    });
  });

  describe('Payload handling', () => {
    it('should not modify the original payload in key down events', () => {
      const targetUserIds = [createUUID()];
      const originalPayload = {
        note: 60,
        velocity: 127,
        targetUserIds,
        extraProperty: 'should not be passed through',
      };

      notesGateway.onKeyDown(originalPayload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        targetUserIds,
        NoteEvents.KEY_DOWN,
        {
          note: 60,
          velocity: 127,
        }
      );

      // Verify extraProperty was not passed through
      const broadcastCall = mockBroadcastToSubset.mock.calls[0];
      expect(broadcastCall[3]).not.toHaveProperty('extraProperty');
      expect(broadcastCall[3]).not.toHaveProperty('targetUserIds');
    });

    it('should not modify the original payload in key up events', () => {
      const targetUserIds = [createUUID()];
      const originalPayload = {
        note: 60,
        targetUserIds,
        extraProperty: 'should not be passed through',
        velocity: 100, // Should not be included in key up
      };

      notesGateway.onKeyUp(originalPayload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        targetUserIds,
        NoteEvents.KEY_UP,
        {
          note: 60,
        }
      );

      // Verify extra properties were not passed through
      const broadcastCall = mockBroadcastToSubset.mock.calls[0];
      expect(broadcastCall[3]).not.toHaveProperty('extraProperty');
      expect(broadcastCall[3]).not.toHaveProperty('targetUserIds');
      expect(broadcastCall[3]).not.toHaveProperty('velocity');
    });
  });

  describe('Event types', () => {
    it('should use correct event type for key down', () => {
      const payload = {
        note: 60,
        velocity: 127,
        targetUserIds: [createUUID()],
      };

      notesGateway.onKeyDown(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        expect.any(Array),
        NoteEvents.KEY_DOWN,
        expect.any(Object)
      );
    });

    it('should use correct event type for key up', () => {
      const payload = {
        note: 60,
        targetUserIds: [createUUID()],
      };

      notesGateway.onKeyUp(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        expect.any(Array),
        NoteEvents.KEY_UP,
        expect.any(Object)
      );
    });
  });

  describe('Socket handling', () => {
    it('should pass the socket to broadcastToSubset for key down', () => {
      const payload = {
        note: 60,
        velocity: 127,
        targetUserIds: [createUUID()],
      };

      notesGateway.onKeyDown(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        expect.any(Array),
        expect.any(String),
        expect.any(Object)
      );

      const broadcastCall = mockBroadcastToSubset.mock.calls[0];
      expect(broadcastCall[0]).toBe(mockSocket);
    });

    it('should pass the socket to broadcastToSubset for key up', () => {
      const payload = {
        note: 60,
        targetUserIds: [createUUID()],
      };

      notesGateway.onKeyUp(payload, mockSocket);

      expect(mockBroadcastToSubset).toHaveBeenCalledWith(
        mockSocket,
        expect.any(Array),
        expect.any(String),
        expect.any(Object)
      );

      const broadcastCall = mockBroadcastToSubset.mock.calls[0];
      expect(broadcastCall[0]).toBe(mockSocket);
    });
  });
});
