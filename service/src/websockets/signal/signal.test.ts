import { vi, describe, it, expect, beforeEach } from 'vitest';
import SessionRegistry from '../SessionRegistry';
import { getSocketSessionId } from '../utils';
import { SignalEvents } from './events';
import { Signal } from './signal';
import type { SignalPayloadDto } from '../../dto/ws/signal.dto';

// Mock dependencies
vi.mock('../utils', () => ({
  getSocketSessionId: vi.fn(),
  getWebSocketGatewayOptions: () => {}
}));

vi.mock('../SessionRegistry', () => ({
  default: {
    getSocket: vi.fn(),
    registerSession: vi.fn(),
    destroySession: vi.fn()
  }
}));

describe('Signal Gateway', () => {
  let gateway: Signal;
  let mockSocket: any;
  let targetSocket: any;

  const mockGetSocketSessionId = getSocketSessionId as any;
  const mockSessionRegistry = SessionRegistry as any;

  beforeEach(() => {
    gateway = new Signal();

    // Create mock sockets
    mockSocket = {
      id: 'sender-socket-id',
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    } as any;

    targetSocket = {
      id: 'target-socket-id',
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    } as any;

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('onSignal', () => {
    const senderUserId = 'sender-user-id';
    const targetUserId = 'target-user-id';

    beforeEach(() => {
      mockGetSocketSessionId.mockReturnValue(senderUserId);
      mockSessionRegistry.getSocket.mockReturnValue(targetSocket);
      mockSocket.to.mockReturnValue({
        emit: vi.fn()
      } as any);
    });

    it('should route signal to target user correctly', () => {
      const payload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: {
          type: 'offer',
          sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n'
        }
      };

      gateway.onSignal(payload, mockSocket);

      expect(mockGetSocketSessionId).toHaveBeenCalledWith(mockSocket);
      expect(mockSessionRegistry.getSocket).toHaveBeenCalledWith(targetUserId);
      expect(mockSocket.to).toHaveBeenCalledWith(targetSocket.id);
    });

    it('should emit signal with correct payload structure', () => {
      const payload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: {
          type: 'answer',
          sdp: 'v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n'
        }
      };

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      gateway.onSignal(payload, mockSocket);

      expect(mockEmit).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: payload.signalData,
        userId: senderUserId
      });
    });

    it('should handle ICE candidate signals', () => {
      const payload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: {
          type: 'candidate',
          candidate: 'candidate:1 1 UDP 2130706431 192.168.1.100 54400 typ host',
          sdpMid: '0',
          sdpMLineIndex: 0
        }
      };

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      gateway.onSignal(payload, mockSocket);

      expect(mockEmit).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: payload.signalData,
        userId: senderUserId
      });
    });

    it('should handle rollback signals', () => {
      const payload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: {
          type: 'rollback'
        }
      };

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      gateway.onSignal(payload, mockSocket);

      expect(mockEmit).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: payload.signalData,
        userId: senderUserId
      });
    });

    it('should handle pranswer signals', () => {
      const payload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: {
          type: 'pranswer',
          sdp: 'v=0\r\no=- 555555555 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n'
        }
      };

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      gateway.onSignal(payload, mockSocket);

      expect(mockEmit).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: payload.signalData,
        userId: senderUserId
      });
    });

    describe('Error Handling', () => {
      it('should handle case when target user socket is not found', () => {
        mockSessionRegistry.getSocket.mockReturnValue(null);

        const payload: SignalPayloadDto = {
          userId: targetUserId,
          signalData: { type: 'offer', sdp: 'test-sdp' }
        };

        // Should not throw
        expect(() => {
          gateway.onSignal(payload, mockSocket);
        }).not.toThrow();

        // Should not call socket.to() when target is not found (method returns early)
        expect(mockSocket.to).not.toHaveBeenCalled();
      });

      it('should handle case when sender user ID is not found', () => {
        mockGetSocketSessionId.mockReturnValue(null);

        const payload: SignalPayloadDto = {
          userId: targetUserId,
          signalData: { type: 'offer', sdp: 'test-sdp' }
        };

        const mockEmit = vi.fn();
        mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

        gateway.onSignal(payload, mockSocket);

        // Should not emit signal when sender is not authenticated (method returns early)
        expect(mockEmit).not.toHaveBeenCalled();
        expect(mockSocket.to).not.toHaveBeenCalled();
      });

      it('should handle empty signal data', () => {
        const payload: SignalPayloadDto = {
          userId: targetUserId,
          signalData: {} as any
        };

        const mockEmit = vi.fn();
        mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

        expect(() => {
          gateway.onSignal(payload, mockSocket);
        }).not.toThrow();

        expect(mockEmit).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
          signalData: {},
          userId: senderUserId
        });
      });
    });

    describe('Message Routing Logic', () => {
      it('should route messages only to intended recipient', () => {
        const payload: SignalPayloadDto = {
          userId: targetUserId,
          signalData: { type: 'offer', sdp: 'test-sdp' }
        };

        gateway.onSignal(payload, mockSocket);

        // Verify it's sent to specific socket, not broadcast
        expect(mockSocket.to).toHaveBeenCalledWith(targetSocket.id);
        expect(mockSocket.to).toHaveBeenCalledTimes(1);
      });

      it('should include sender information in routed message', () => {
        const payload: SignalPayloadDto = {
          userId: targetUserId,
          signalData: { type: 'offer', sdp: 'test-sdp' }
        };

        const mockEmit = vi.fn();
        mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

        gateway.onSignal(payload, mockSocket);

        const emittedData = mockEmit.mock.calls[0]?.[1];
        expect(emittedData).toHaveProperty('userId', senderUserId);
        expect(emittedData).toHaveProperty('signalData', payload.signalData);
      });
    });

    describe('Signal Data Preservation', () => {
      it('should preserve complex SDP data', () => {
        const complexSdp = `v=0
o=- 4611731400430051336 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
a=extmap-allow-mixed
a=msid-semantic: WMS
m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 110 112 113 126
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:abc123
a=ice-pwd:def456
a=ice-options:trickle
a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99
a=setup:actpass
a=mid:0
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=sendrecv
a=msid:- {track-id}
a=rtcp-mux
a=rtpmap:111 opus/48000/2`;

        const payload: SignalPayloadDto = {
          userId: targetUserId,
          signalData: {
            type: 'offer',
            sdp: complexSdp
          }
        };

        const mockEmit = vi.fn();
        mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

        gateway.onSignal(payload, mockSocket);

        const emittedData = mockEmit.mock.calls[0]?.[1];
        expect(emittedData.signalData.sdp).toBe(complexSdp);
      });

      it('should preserve ICE candidate data structure', () => {
        const candidate = {
          type: 'candidate',
          candidate: 'candidate:842163049 1 udp 1677729535 192.168.0.100 54400 typ srflx raddr 192.168.0.100 rport 54400 generation 0 ufrag abc123 network-cost 999',
          sdpMid: '0',
          sdpMLineIndex: 0,
          usernameFragment: 'abc123'
        };

        const payload: SignalPayloadDto = {
          userId: targetUserId,
          signalData: candidate
        };

        const mockEmit = vi.fn();
        mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

        gateway.onSignal(payload, mockSocket);

        const emittedData = mockEmit.mock.calls[0]?.[1];
        expect(emittedData.signalData).toEqual(candidate);
      });
    });
  });
});
