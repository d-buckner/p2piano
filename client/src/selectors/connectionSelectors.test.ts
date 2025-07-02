import { describe, it, expect } from 'vitest';
import { Transport } from '../constants';
import {
  selectConnection,
  selectPeerConnections,
  selectMaxLatency,
  selectPeerConnection,
  selectConnectedPeerIds,
} from './connectionSelectors';
import type { RootState } from '../app/store';


const createMockState = (connection: RootState['connection']): RootState => ({
  notesByMidi: {},
  workspace: {
    room: null,
    userId: null,
  },
  connection,
});

describe('connectionSelectors', () => {
  describe('selectConnection', () => {
    it('should return the entire connection state', () => {
      const connection = {
        peerConnections: {
          user1: { transport: Transport.WEBSOCKET, latency: 50 },
          user2: { transport: Transport.WEBRTC, latency: 25 },
        },
        maxLatency: 100,
      };
      const state = createMockState(connection);

      const result = selectConnection(state);

      expect(result).toBe(connection);
    });
  });

  describe('selectPeerConnections', () => {
    it('should return the peerConnections object from connection', () => {
      const peerConnections = {
        user1: { transport: Transport.WEBSOCKET, latency: 50 },
        user2: { transport: Transport.WEBRTC, latency: 25 },
      };
      const connection = { peerConnections, maxLatency: 100 };
      const state = createMockState(connection);

      const result = selectPeerConnections(state);

      expect(result).toBe(peerConnections);
    });

    it('should return empty object when no peers exist', () => {
      const connection = { peerConnections: {}, maxLatency: 0 };
      const state = createMockState(connection);

      const result = selectPeerConnections(state);

      expect(result).toEqual({});
    });
  });

  describe('selectMaxLatency', () => {
    it('should return the maxLatency value', () => {
      const connection = {
        peerConnections: {},
        maxLatency: 150,
      };
      const state = createMockState(connection);

      const result = selectMaxLatency(state);

      expect(result).toBe(150);
    });

    it('should return 0 when maxLatency is 0', () => {
      const connection = {
        peerConnections: {},
        maxLatency: 0,
      };
      const state = createMockState(connection);

      const result = selectMaxLatency(state);

      expect(result).toBe(0);
    });
  });

  describe('selectPeerConnection', () => {
    it('should return specific peer connection by ID', () => {
      const user1Connection = { transport: Transport.WEBSOCKET, latency: 50 };
      const user2Connection = { transport: Transport.WEBRTC, latency: 25 };
      
      const connection = {
        peerConnections: {
          user1: user1Connection,
          user2: user2Connection,
        },
        maxLatency: 100,
      };
      const state = createMockState(connection);

      const result = selectPeerConnection('user1')(state);

      expect(result).toBe(user1Connection);
    });

    it('should return undefined for non-existent peer', () => {
      const connection = {
        peerConnections: {
          user1: { transport: Transport.WEBSOCKET, latency: 50 },
        },
        maxLatency: 100,
      };
      const state = createMockState(connection);

      const result = selectPeerConnection('nonexistent')(state);

      expect(result).toBeUndefined();
    });

    it('should return undefined when no peers exist', () => {
      const connection = { peerConnections: {}, maxLatency: 0 };
      const state = createMockState(connection);

      const result = selectPeerConnection('user1')(state);

      expect(result).toBeUndefined();
    });
  });

  describe('selectConnectedPeerIds', () => {
    it('should return array of peer IDs', () => {
      const connection = {
        peerConnections: {
          user1: { transport: Transport.WEBSOCKET, latency: 50 },
          user2: { transport: Transport.WEBRTC, latency: 25 },
          user3: { transport: Transport.WEBSOCKET, latency: 75 },
        },
        maxLatency: 100,
      };
      const state = createMockState(connection);

      const result = selectConnectedPeerIds(state);

      expect(result).toEqual(['user1', 'user2', 'user3']);
    });

    it('should return empty array when no peers exist', () => {
      const connection = { peerConnections: {}, maxLatency: 0 };
      const state = createMockState(connection);

      const result = selectConnectedPeerIds(state);

      expect(result).toEqual([]);
    });

    it('should preserve order of peer IDs as stored', () => {
      const connection = {
        peerConnections: {
          alice: { transport: Transport.WEBRTC, latency: 30 },
          bob: { transport: Transport.WEBSOCKET, latency: 60 },
          charlie: { transport: Transport.WEBRTC, latency: 20 },
        },
        maxLatency: 100,
      };
      const state = createMockState(connection);

      const result = selectConnectedPeerIds(state);

      expect(result).toEqual(['alice', 'bob', 'charlie']);
    });
  });

  describe('integration scenarios', () => {
    it('should handle mixed transport types and latencies', () => {
      const connection = {
        peerConnections: {
          'low-latency-webrtc': { transport: Transport.WEBRTC, latency: 15 },
          'high-latency-websocket': { transport: Transport.WEBSOCKET, latency: 200 },
          'medium-latency-webrtc': { transport: Transport.WEBRTC, latency: 75 },
        },
        maxLatency: 250,
      };
      const state = createMockState(connection);

      // Test all selectors work together
      const allConnection = selectConnection(state);
      const peerConnections = selectPeerConnections(state);
      const maxLatency = selectMaxLatency(state);
      const peerIds = selectConnectedPeerIds(state);
      const webrtcPeer = selectPeerConnection('low-latency-webrtc')(state);

      expect(allConnection.peerConnections).toBe(peerConnections);
      expect(allConnection.maxLatency).toBe(maxLatency);
      expect(peerIds).toHaveLength(3);
      expect(webrtcPeer?.transport).toBe(Transport.WEBRTC);
      expect(webrtcPeer?.latency).toBe(15);
    });

    it('should handle edge case with very high latencies', () => {
      const connection = {
        peerConnections: {
          'satellite-user': { transport: Transport.WEBSOCKET, latency: 1500 },
          'dial-up-user': { transport: Transport.WEBSOCKET, latency: 2000 },
        },
        maxLatency: 2500,
      };
      const state = createMockState(connection);

      expect(selectMaxLatency(state)).toBe(2500);
      expect(selectPeerConnection('satellite-user')(state)?.latency).toBe(1500);
      expect(selectConnectedPeerIds(state)).toEqual(['satellite-user', 'dial-up-user']);
    });

    it('should handle state transitions correctly', () => {
      // Start with empty state
      let connection = { peerConnections: {}, maxLatency: 0 };
      let state = createMockState(connection);

      expect(selectConnectedPeerIds(state)).toEqual([]);
      expect(selectMaxLatency(state)).toBe(0);

      // Add first peer
      connection = {
        peerConnections: {
          user1: { transport: Transport.WEBRTC, latency: 50 },
        },
        maxLatency: 50,
      };
      state = createMockState(connection);

      expect(selectConnectedPeerIds(state)).toEqual(['user1']);
      expect(selectMaxLatency(state)).toBe(50);

      // Add second peer with higher latency
      connection = {
        peerConnections: {
          user1: { transport: Transport.WEBRTC, latency: 50 },
          user2: { transport: Transport.WEBSOCKET, latency: 100 },
        },
        maxLatency: 100,
      };
      state = createMockState(connection);

      expect(selectConnectedPeerIds(state)).toEqual(['user1', 'user2']);
      expect(selectMaxLatency(state)).toBe(100);
    });
  });
});