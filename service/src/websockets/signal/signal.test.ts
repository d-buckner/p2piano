import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getSocketSessionId } from '../utils';
import { SignalEvents } from './events';
import { Signal } from './signal';
import type { SignalPayloadDto } from '../../dto/ws/signal.dto';

// Mock dependencies
vi.mock('../utils', () => ({
  getSocketSessionId: vi.fn(),
  getWebSocketGatewayOptions: () => {},
}));

describe('Signal Gateway (Simplified)', () => {
  let gateway: Signal;
  let mockSocket: any;
  const mockGetSocketSessionId = getSocketSessionId as any;

  beforeEach(() => {
    gateway = new Signal();

    mockSocket = {
      id: 'sender-socket-id',
      to: vi.fn().mockReturnValue({ emit: vi.fn() }),
      emit: vi.fn(),
    } as any;

    vi.clearAllMocks();
  });

  describe('onSignal', () => {
    const senderUserId = 'sender-user-id';
    const targetUserId = 'target-user-id';

    beforeEach(() => {
      mockGetSocketSessionId.mockReturnValue(senderUserId);
    });

    it('should route signal to target user room directly', async () => {
      const payload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: {
          type: 'offer',
          sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n'
        }
      };

      await gateway.onSignal(payload, mockSocket);

      expect(mockGetSocketSessionId).toHaveBeenCalledWith(mockSocket);
      expect(mockSocket.to).toHaveBeenCalledWith(targetUserId); // Routes to user's room directly
    });

    it('should emit signal with correct payload structure', async () => {
      const payload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: {
          type: 'answer',
          sdp: 'test-answer-sdp'
        }
      };

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit });

      await gateway.onSignal(payload, mockSocket);

      expect(mockEmit).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: payload.signalData,
        userId: senderUserId,
      });
    });

    it('should handle missing sender user ID gracefully', async () => {
      mockGetSocketSessionId.mockReturnValue(null);

      const payload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: { type: 'offer', sdp: 'test-sdp' }
      };

      await gateway.onSignal(payload, mockSocket);

      // Should not emit signal when sender is not authenticated
      expect(mockSocket.to).not.toHaveBeenCalled();
    });

    it('should still emit to room even if target user is not connected', async () => {
      const targetUserId = 'non-existent-user';
      
      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      const payload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: { type: 'offer', sdp: 'test-sdp' }
      };

      await gateway.onSignal(payload, mockSocket);

      // Should still emit to the user's room (Socket.IO handles if room is empty)
      expect(mockSocket.to).toHaveBeenCalledWith(targetUserId);
    });

    it('should preserve signal data integrity', async () => {
      const complexSignalData = {
        type: 'candidate',
        candidate: 'candidate:842163049 1 udp 1677729535 192.168.0.100 54400 typ srflx raddr 192.168.0.100 rport 54400 generation 0 ufrag abc123 network-cost 999',
        sdpMid: '0',
        sdpMLineIndex: 0,
        usernameFragment: 'abc123'
      };

      const payload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: complexSignalData
      };

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit });

      await gateway.onSignal(payload, mockSocket);

      const emittedData = mockEmit.mock.calls[0]?.[1];
      expect(emittedData.signalData).toEqual(complexSignalData);
    });
  });
});
