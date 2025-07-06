import { vi, describe, it, expect, beforeEach } from 'vitest';
import SessionRegistry from '../SessionRegistry';
import { getSocketSessionId } from '../utils';
import { SignalEvents } from './events';
import { Signal } from './signal';
import type { SignalPayloadDto } from '../../dto/ws/signal.dto';
import type { Socket } from 'socket.io';

// Mock dependencies
vi.mock('../SessionRegistry');
vi.mock('../utils');

describe('Signal Gateway Message Flow', () => {
  let gateway: Signal;
  let mockSocket: any;
  let targetSocket: any;
  let mockSessionRegistry: any;
  let mockGetSocketSessionId: any;

  beforeEach(() => {
    mockSessionRegistry = SessionRegistry as any;
    mockGetSocketSessionId = getSocketSessionId as any;

    gateway = new Signal();

    // Setup mock sockets
    mockSocket = {
      id: 'sender-socket',
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    } as any;

    targetSocket = {
      id: 'target-socket',
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    } as any;

    vi.clearAllMocks();
  });

  describe('WebRTC Signaling Flow', () => {
    it('should route offer signals correctly between peers', () => {
      const senderUserId = 'user-1';
      const targetUserId = 'user-2';
      
      mockGetSocketSessionId.mockReturnValue(senderUserId);
      mockSessionRegistry.getSocket.mockReturnValue(targetSocket);

      const offerPayload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: {
          type: 'offer',
          sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n'
        }
      };

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      gateway.onSignal(offerPayload, mockSocket);

      expect(mockSocket.to).toHaveBeenCalledWith(targetSocket.id);
      expect(mockEmit).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: offerPayload.signalData,
        userId: senderUserId
      });
    });

    it('should handle answer signals in response', () => {
      const senderUserId = 'user-2';
      const targetUserId = 'user-1';
      
      mockGetSocketSessionId.mockReturnValue(senderUserId);
      mockSessionRegistry.getSocket.mockReturnValue(targetSocket);

      const answerPayload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: {
          type: 'answer',
          sdp: 'v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n'
        }
      };

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      gateway.onSignal(answerPayload, mockSocket);

      expect(mockEmit).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: answerPayload.signalData,
        userId: senderUserId
      });
    });

    it('should route ICE candidates between specific peers', () => {
      const senderUserId = 'user-1';
      const targetUserId = 'user-2';
      
      mockGetSocketSessionId.mockReturnValue(senderUserId);
      mockSessionRegistry.getSocket.mockReturnValue(targetSocket);

      const candidatePayload: SignalPayloadDto = {
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

      gateway.onSignal(candidatePayload, mockSocket);

      expect(mockEmit).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: candidatePayload.signalData,
        userId: senderUserId
      });
    });
  });

  describe('Multi-peer Scenarios', () => {
    it('should handle signals between multiple peer pairs independently', () => {
      const user1 = 'user-1';
      const user2 = 'user-2';
      const user3 = 'user-3';

      const socket2 = { id: 'socket-2' } as Socket;
      const socket3 = { id: 'socket-3' } as Socket;

      // User 1 sends to User 2
      mockGetSocketSessionId.mockReturnValueOnce(user1);
      mockSessionRegistry.getSocket.mockReturnValueOnce(socket2);

      const mockEmit1 = vi.fn();
      mockSocket.to.mockReturnValueOnce({ emit: mockEmit1 } as any);

      gateway.onSignal({
        userId: user2,
        signalData: { type: 'offer', sdp: 'offer-1-to-2' }
      }, mockSocket);

      // User 1 sends to User 3  
      mockGetSocketSessionId.mockReturnValueOnce(user1);
      mockSessionRegistry.getSocket.mockReturnValueOnce(socket3);

      const mockEmit2 = vi.fn();
      mockSocket.to.mockReturnValueOnce({ emit: mockEmit2 } as any);

      gateway.onSignal({
        userId: user3,
        signalData: { type: 'offer', sdp: 'offer-1-to-3' }
      }, mockSocket);

      expect(mockSocket.to).toHaveBeenCalledWith(socket2.id);
      expect(mockSocket.to).toHaveBeenCalledWith(socket3.id);
      expect(mockEmit1).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: { type: 'offer', sdp: 'offer-1-to-2' },
        userId: user1
      });
      expect(mockEmit2).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: { type: 'offer', sdp: 'offer-1-to-3' },
        userId: user1
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing target user gracefully', () => {
      const senderUserId = 'user-1';
      const nonExistentUserId = 'non-existent-user';
      
      mockGetSocketSessionId.mockReturnValue(senderUserId);
      mockSessionRegistry.getSocket.mockReturnValue(null);

      expect(() => {
        gateway.onSignal({
          userId: nonExistentUserId,
          signalData: { type: 'offer', sdp: 'test-sdp' }
        }, mockSocket);
      }).not.toThrow();

      // Should not attempt to send signal when target user not found
      expect(mockSocket.to).not.toHaveBeenCalled();
    });

    it('should handle missing sender user ID gracefully', () => {
      const targetUserId = 'user-2';
      
      mockGetSocketSessionId.mockReturnValue(null);
      mockSessionRegistry.getSocket.mockReturnValue(targetSocket);

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      expect(() => {
        gateway.onSignal({
          userId: targetUserId,
          signalData: { type: 'offer', sdp: 'test-sdp' }
        }, mockSocket);
      }).not.toThrow();

      // Should not attempt to send signal when sender is unauthenticated
      expect(mockSocket.to).not.toHaveBeenCalled();
      expect(mockEmit).not.toHaveBeenCalled();
    });
  });

  describe('Signal Data Integrity', () => {
    it('should preserve complex SDP data unchanged', () => {
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

      mockGetSocketSessionId.mockReturnValue('user-1');
      mockSessionRegistry.getSocket.mockReturnValue(targetSocket);

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      gateway.onSignal({
        userId: 'user-2',
        signalData: { type: 'offer', sdp: complexSdp }
      }, mockSocket);

      const emittedData = mockEmit.mock.calls[0][1];
      expect(emittedData.signalData.sdp).toBe(complexSdp);
    });

    it('should preserve ICE candidate structure with all fields', () => {
      const complexCandidate = {
        type: 'candidate',
        candidate: 'candidate:842163049 1 udp 1677729535 192.168.0.100 54400 typ srflx raddr 192.168.0.100 rport 54400 generation 0 ufrag abc123 network-cost 999',
        sdpMid: '0',
        sdpMLineIndex: 0,
        usernameFragment: 'abc123'
      };

      mockGetSocketSessionId.mockReturnValue('user-1');
      mockSessionRegistry.getSocket.mockReturnValue(targetSocket);

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      gateway.onSignal({
        userId: 'user-2',
        signalData: complexCandidate
      }, mockSocket);

      const emittedData = mockEmit.mock.calls[0][1];
      expect(emittedData.signalData).toEqual(complexCandidate);
    });
  });
});
