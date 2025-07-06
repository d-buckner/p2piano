import type { Session } from '../entities/Session';
import type { FastifyRequest, FastifyReply } from 'fastify';


export interface Request extends FastifyRequest {
  session?: Session;
  cookies: {
    sessionId?: string;
  };
}

export interface Reply extends FastifyReply {
  cookie(name: string, value: string, options?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
    path?: string;
  }): this;
}
