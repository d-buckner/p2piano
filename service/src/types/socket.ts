import type { Session } from '../entities/Session';
import type { Socket as SocketIOSocket } from 'socket.io';

// All connected sockets in our application have a session
// (unauthenticated sockets are disconnected by the auth guard)
export interface AuthenticatedSocket extends SocketIOSocket {
  session: Session;
}
