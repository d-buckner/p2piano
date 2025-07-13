import { vi, describe, it, expect, beforeEach } from 'vitest';
import { extractSessionIdFromSocket, sendTo } from '../utils';
import { SignalEvents } from './events';
import { Signal } from './signal';
import type { SignalPayloadDto } from '../../dto/ws/signal.dto';
import type { Socket } from 'socket.io';

// Mock dependencies
vi.mock('../utils', () => ({
  extractSessionIdFromSocket: vi.fn(),
  sendTo: vi.fn(),
  getWebSocketGatewayOptions: () => {},
}));

vi.mock('../../guards/signalthrottler.guard', () => ({
  SignalThrottlerGuard: class MockSignalThrottlerGuard {},
}));

vi.mock('@nestjs/common', () => ({
  UseGuards: () => () => {},
  Logger: class MockLogger {
    warn = vi.fn();
    debug = vi.fn();
    error = vi.fn();
  },
}));

vi.mock('@nestjs/websockets', () => ({
  ConnectedSocket: () => () => {},
  MessageBody: () => () => {},
  SubscribeMessage: () => () => {},
  WebSocketGateway: () => () => {},
}));

vi.mock('../../pipes/ws-validation.pipe', () => ({
  WsValidationPipe: class MockWsValidationPipe {},
}));

describe('Signal Gateway Message Flow', () => {
  let gateway: Signal;
  let mockSocket: any;

  beforeEach(() => {
    gateway = new Signal();

    // Setup mock socket
    mockSocket = {
      id: 'sender-socket-id',
      emit: vi.fn(),
    } as any;

    // Setup session extraction mock to return a valid user ID
    (extractSessionIdFromSocket as any).mockReturnValue('sender-user-id');

    vi.clearAllMocks();
  });

  describe('WebRTC Signaling Flow', () => {
    it('should route offer signals correctly between peers', async () => {
      const offerPayload: SignalPayloadDto = {
        userId: 'target-user-id',
        signalData: {
          type: 'offer',
          sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n'
        }
      };

      await gateway.onSignal(offerPayload, mockSocket);

      expect(sendTo).toHaveBeenCalledWith(mockSocket, 'target-user-id', SignalEvents.SIGNAL, {
        signalData: offerPayload.signalData,
        userId: 'sender-user-id',
      });
    });

    it('should handle answer signals in response', async () => {
      const answerPayload: SignalPayloadDto = {
        userId: 'target-user-id',
        signalData: {
          type: 'answer',
          sdp: 'v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n'
        }
      };

      await gateway.onSignal(answerPayload, mockSocket);

      expect(sendTo).toHaveBeenCalledWith(mockSocket, 'target-user-id', SignalEvents.SIGNAL, {
        signalData: answerPayload.signalData,
        userId: 'sender-user-id',
      });
    });

    it('should route ICE candidates between specific peers', async () => {
      const candidatePayload: SignalPayloadDto = {
        userId: 'target-user-id',
        signalData: {
          type: 'candidate',
          candidate: 'candidate:1 1 UDP 2130706431 192.168.1.100 54400 typ host',
          sdpMid: '0',
          sdpMLineIndex: 0
        }
      };

      await gateway.onSignal(candidatePayload, mockSocket);

      expect(sendTo).toHaveBeenCalledWith(mockSocket, 'target-user-id', SignalEvents.SIGNAL, {
        signalData: candidatePayload.signalData,
        userId: 'sender-user-id',
      });
    });
  });

  describe('Multi-peer Scenarios', () => {
    it('should handle signals between multiple peer pairs independently', async () => {
      // Test that each signal is routed to correct target user's room
      const payload1: SignalPayloadDto = {
        userId: 'user-2',
        signalData: { type: 'offer', sdp: 'test-sdp-1' }
      };

      const payload2: SignalPayloadDto = {
        userId: 'user-3',
        signalData: { type: 'offer', sdp: 'test-sdp-2' }
      };

      await gateway.onSignal(payload1, mockSocket);
      await gateway.onSignal(payload2, mockSocket);

      expect(sendTo).toHaveBeenCalledWith(mockSocket, 'user-2', SignalEvents.SIGNAL, {
        signalData: payload1.signalData,
        userId: 'sender-user-id',
      });
      expect(sendTo).toHaveBeenCalledWith(mockSocket, 'user-3', SignalEvents.SIGNAL, {
        signalData: payload2.signalData,
        userId: 'sender-user-id',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing target user gracefully', async () => {
      const payload: SignalPayloadDto = {
        userId: 'non-existent-user',
        signalData: { type: 'offer', sdp: 'test-sdp' }
      };

      // Should not throw an error
      await expect(gateway.onSignal(payload, mockSocket)).resolves.toBeUndefined();

      // Signal should still be sent to the target room (sendTo handles if user exists)
      expect(sendTo).toHaveBeenCalledWith(mockSocket, 'non-existent-user', SignalEvents.SIGNAL, {
        signalData: payload.signalData,
        userId: 'sender-user-id',
      });
    });

    it('should handle unauthenticated sockets gracefully', async () => {
      // Mock extract session to return null (unauthenticated)
      (extractSessionIdFromSocket as any).mockReturnValue(null);

      const payload: SignalPayloadDto = {
        userId: 'target-user-id',
        signalData: { type: 'offer', sdp: 'test-sdp' }
      };

      await gateway.onSignal(payload, mockSocket);

      // Should not emit signal when socket is unauthenticated
      expect(sendTo).not.toHaveBeenCalled();
    });

    it('should handle malformed signal data gracefully', async () => {
      const payload: SignalPayloadDto = {
        userId: 'target-user-id',
        signalData: { type: 'candidate' } // Missing required candidate fields
      };

      // Should not throw an error
      await expect(gateway.onSignal(payload, mockSocket)).resolves.toBeUndefined();

      // Signal should still be forwarded (validation is client-side responsibility)
      expect(sendTo).toHaveBeenCalledWith(mockSocket, 'target-user-id', SignalEvents.SIGNAL, {
        signalData: payload.signalData,
        userId: 'sender-user-id',
      });
    });
  });
});
