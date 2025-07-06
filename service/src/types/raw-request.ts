
import type { BroadcastOperator, DefaultEventsMap } from 'socket.io';

/**
 * Interface for raw Node.js HTTP requests used in Socket.io allowRequest callbacks
 * This replaces the unsafe 'any' type with proper type definitions
 */
export interface RawHttpRequest {
  url?: string;
  method?: string;
  headers?: {
    'x-forwarded-for'?: string;
    'x-real-ip'?: string;
    'authorization'?: string;
    'cookie'?: string;
    'user-agent'?: string;
  };
  socket?: {
    remoteAddress?: string;
    remotePort?: number;
  };
  connection?: {
    remoteAddress?: string;
    remotePort?: number;
  };
}

/**
 * Interface for Socket.io handshake query parameters
 */
export interface SocketHandshakeQuery {
  roomId?: string;
  displayName?: string;
  transport?: string;
}

/**
 * Interface for Socket.io handshake auth object
 */
export interface SocketHandshakeAuth {
  sessionId?: string;
  token?: string;
}

/**
 * Interface for Socket.io handshake headers
 */
export interface SocketHandshakeHeaders {
  authorization?: string;
  cookie?: string;
  'user-agent'?: string;
  'x-forwarded-for'?: string;
  'x-real-ip'?: string;
}

/**
 * Interface for Socket.io handshake object
 */
export interface SocketHandshake {
  auth: SocketHandshakeAuth;
  query: SocketHandshakeQuery;
  headers: SocketHandshakeHeaders;
  time: string;
  address: string;
  xdomain: boolean;
  secure: boolean;
  issued: number;
  url: string;
}

/**
 * Interface for Socket.io connection object
 */
export interface SocketConnection {
  remoteAddress?: string;
  remotePort?: number;
}

/**
 * Extended interface for Socket.io sockets with proper typing
 */
export interface SocketWithHandshake {
  id: string;
  handshake: SocketHandshake;
  conn?: SocketConnection;
  disconnect: () => void;
  emit: (event: string, data?: unknown) => boolean;
  to: (room: string) => BroadcastOperator<DefaultEventsMap, DefaultEventsMap>;
  join: (room: string) => void;
  leave: (room: string) => void;
}

