import { vi, describe, it, expect, beforeEach } from 'vitest';
import SessionRegistry from '../SessionRegistry';
import { getSocketSessionId } from '../utils';
import { SignalEvents } from './events';
import { Signal } from './signal';
import type { SignalPayloadDto } from '../../dto/ws/signal.dto';
import type { Socket } from 'socket.io';

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-server-id'),
}));

// Mock dependencies
vi.mock('../SessionRegistry', () => ({
  default: {
    getSocketMetadata: vi.fn(),
    getServerId: vi.fn(),
    registerSession: vi.fn(),
    destroySession: vi.fn(),
  },
}));
vi.mock('../utils', () => ({
  getSocketSessionId: vi.fn(),
  getWebSocketGatewayOptions: () => {},
}));

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

    // Setup common mocks
    mockSessionRegistry.getServerId.mockReturnValue('test-server');

    vi.clearAllMocks();
  });

  describe('WebRTC Signaling Flow', () => {
    it('should route offer signals correctly between peers', async () => {
      const senderUserId = 'user-1';
      const targetUserId = 'user-2';
      
      mockGetSocketSessionId.mockReturnValue(senderUserId);
      mockSessionRegistry.getSocketMetadata.mockResolvedValue({
        serverId: 'test-server',
        socketId: targetSocket.id
      });

      const offerPayload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: {
          type: 'offer',
          sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n'
        }
      };

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      await gateway.onSignal(offerPayload, mockSocket);

      expect(mockSocket.to).toHaveBeenCalledWith(targetSocket.id);
      expect(mockEmit).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: offerPayload.signalData,
        userId: senderUserId,
      });
    });

    it('should handle answer signals in response', async () => {
      const senderUserId = 'user-2';
      const targetUserId = 'user-1';
      
      mockGetSocketSessionId.mockReturnValue(senderUserId);
      mockSessionRegistry.getSocketMetadata.mockResolvedValue({
        serverId: 'test-server',
        socketId: targetSocket.id
      });

      const answerPayload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: {
          type: 'answer',
          sdp: 'v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n'
        }
      };

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      await gateway.onSignal(answerPayload, mockSocket);

      expect(mockSocket.to).toHaveBeenCalledWith(targetSocket.id);
      expect(mockEmit).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: answerPayload.signalData,
        userId: senderUserId,
      });
    });

    it('should route ICE candidates between specific peers', async () => {
      const senderUserId = 'user-1';
      const targetUserId = 'user-2';
      
      mockGetSocketSessionId.mockReturnValue(senderUserId);
      mockSessionRegistry.getSocketMetadata.mockResolvedValue({
        serverId: 'test-server',
        socketId: targetSocket.id
      });

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

      await gateway.onSignal(candidatePayload, mockSocket);

      expect(mockSocket.to).toHaveBeenCalledWith(targetSocket.id);
      expect(mockEmit).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: candidatePayload.signalData,
        userId: senderUserId,
      });
    });
  });

  describe('Multi-peer Scenarios', () => {
    it('should handle signals between multiple peer pairs independently', async () => {
      const user1 = 'user-1';
      const user2 = 'user-2';
      const user3 = 'user-3';

      const socket1 = { ...mockSocket, id: 'socket-1' };
      const socket2 = { ...targetSocket, id: 'socket-2' };
      const socket3 = { id: 'socket-3', to: vi.fn().mockReturnThis(), emit: vi.fn() } as any;

      // User 1 sends to User 2
      mockGetSocketSessionId.mockReturnValueOnce(user1);
      mockSessionRegistry.getSocketMetadata.mockResolvedValueOnce({
        serverId: 'test-server',
        socketId: socket2.id
      });

      const mockEmit1 = vi.fn();
      socket1.to.mockReturnValueOnce({ emit: mockEmit1 } as any);

      const payload1: SignalPayloadDto = {
        userId: user2,
        signalData: { type: 'offer', sdp: 'test-sdp-1' }
      };

      await gateway.onSignal(payload1, socket1);

      // User 3 sends to User 1
      mockGetSocketSessionId.mockReturnValueOnce(user3);
      mockSessionRegistry.getSocketMetadata.mockResolvedValueOnce({
        serverId: 'test-server',
        socketId: socket1.id
      });

      const mockEmit2 = vi.fn();
      socket3.to.mockReturnValueOnce({ emit: mockEmit2 } as any);

      const payload2: SignalPayloadDto = {
        userId: user1,
        signalData: { type: 'offer', sdp: 'test-sdp-2' }
      };

      await gateway.onSignal(payload2, socket3);

      // Verify both signals were routed correctly
      expect(mockEmit1).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: payload1.signalData,
        userId: user1,
      });

      expect(mockEmit2).toHaveBeenCalledWith(SignalEvents.SIGNAL, {
        signalData: payload2.signalData,
        userId: user3,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing target user gracefully', async () => {
      const senderUserId = 'user-1';
      const targetUserId = 'non-existent-user';
      
      mockGetSocketSessionId.mockReturnValue(senderUserId);
      mockSessionRegistry.getSocketMetadata.mockResolvedValue(null);

      const payload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: { type: 'offer', sdp: 'test-sdp' }
      };

      // Should not throw
      await expect(gateway.onSignal(payload, mockSocket)).resolves.not.toThrow();

      // Should not attempt to route signal
      expect(mockSocket.to).not.toHaveBeenCalled();
    });

    it('should handle missing sender user ID gracefully', async () => {
      const targetUserId = 'user-2';
      
      mockGetSocketSessionId.mockReturnValue(null);
      mockSessionRegistry.getSocketMetadata.mockResolvedValue({
        serverId: 'test-server',
        socketId: targetSocket.id
      });

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      const payload: SignalPayloadDto = {
        userId: targetUserId,
        signalData: { type: 'offer', sdp: 'test-sdp' }
      };

      await gateway.onSignal(payload, mockSocket);

      // Should not emit signal when sender is not authenticated
      expect(mockEmit).not.toHaveBeenCalled();
      expect(mockSocket.to).not.toHaveBeenCalled();
    });
  });

  describe('Signal Data Integrity', () => {
    it('should preserve complex SDP data unchanged', async () => {
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
      mockSessionRegistry.getSocketMetadata.mockResolvedValue({
        serverId: 'test-server',
        socketId: targetSocket.id
      });

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      const payload: SignalPayloadDto = {
        userId: 'user-2',
        signalData: {
          type: 'offer',
          sdp: complexSdp
        }
      };

      await gateway.onSignal(payload, mockSocket);

      const emittedData = mockEmit.mock.calls[0]?.[1];
      expect(emittedData.signalData.sdp).toBe(complexSdp);
    });

    it('should preserve ICE candidate structure with all fields', async () => {
      const candidate = {
        type: 'candidate',
        candidate: 'candidate:842163049 1 udp 1677729535 192.168.0.100 54400 typ srflx raddr 192.168.0.100 rport 54400 generation 0 ufrag abc123 network-cost 999',
        sdpMid: '0',
        sdpMLineIndex: 0,
        usernameFragment: 'abc123'
      };

      mockGetSocketSessionId.mockReturnValue('user-1');
      mockSessionRegistry.getSocketMetadata.mockResolvedValue({
        serverId: 'test-server',
        socketId: targetSocket.id
      });

      const mockEmit = vi.fn();
      mockSocket.to.mockReturnValue({ emit: mockEmit } as any);

      const payload: SignalPayloadDto = {
        userId: 'user-2',
        signalData: candidate
      };

      await gateway.onSignal(payload, mockSocket);

      const emittedData = mockEmit.mock.calls[0]?.[1];
      expect(emittedData.signalData).toEqual(candidate);
    });
  });
});
