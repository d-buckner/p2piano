import { Injectable, Logger } from '@nestjs/common';
import * as cookie from 'cookie';
import { SessionConfigService } from '../config/session-config.service';
import SessionProvider from '../entities/Session';
import type { Session } from '../entities/Session';
import type { RawHttpRequest } from '../types/raw-request';
import type { Request, Reply } from '../types/request';
import type { AuthenticatedSocket } from '../types/socket';


@Injectable()
export class SessionValidatorService {
  private readonly logger = new Logger(SessionValidatorService.name);

  constructor(private readonly sessionConfig: SessionConfigService) {}

  /**
   * Validates a session for an HTTP request
   * @returns The validated session or null if invalid
   */
  async validateRequest(request: Request): Promise<Session | null> {
    const sessionId = this.extractSessionId(request);
    if (!sessionId) {
      return null;
    }

    const ipAddress = await this.extractIpFromRequest(request);
    return this.validateSession(sessionId, ipAddress);
  }

  /**
   * Validates a session for a WebSocket connection
   * @returns The validated session or null if invalid
   */
  async validateSocket(socket: AuthenticatedSocket): Promise<Session | null> {
    const sessionId = this.extractSessionIdFromSocket(socket);
    if (!sessionId) {
      return null;
    }

    const ipAddress = await this.extractIpFromSocket(socket);
    return this.validateSession(sessionId, ipAddress);
  }

  /**
   * Validates a session from a raw request (used in Socket.io allowRequest)
   * @returns The validated session or null if invalid
   */
  async validateRawRequest(req: RawHttpRequest): Promise<Session | null> {
    const sessionId = this.extractSessionIdFromRawRequest(req);
    if (!sessionId) {
      return null;
    }

    const ipAddress = await this.extractIpFromRawRequest(req);
    return this.validateSession(sessionId, ipAddress);
  }

  /**
   * Validates and attaches a session to an HTTP request
   * @returns true if session is valid and attached, false otherwise
   */
  async validateAndAttachToRequest(request: Request): Promise<boolean> {
    const session = await this.validateRequest(request);
    if (session) {
      request.session = session;
      return true;
    }
    return false;
  }

  /**
   * Validates and attaches a session to a WebSocket
   * @returns true if session is valid and attached, false otherwise
   */
  async validateAndAttachToSocket(socket: AuthenticatedSocket): Promise<boolean> {
    const session = await this.validateSocket(socket);
    if (session) {
      socket.session = session;
      return true;
    }
    return false;
  }

  /**
   * Creates or validates a session for auto-session scenarios
   * @returns The session (existing or newly created)
   */
  async getOrCreateSession(request: Request, reply: Reply): Promise<Session> {
    // Try to validate existing session first
    const existingSession = await this.validateRequest(request);
    if (existingSession) {
      request.session = existingSession;
      return existingSession;
    }

    // Create new session
    const ipAddress = await this.extractIpFromRequest(request);
    const newSession = await SessionProvider.create(ipAddress);
    
    // Set session cookie
    reply.cookie('sessionId', newSession.sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    request.session = newSession;
    this.logger.log(`Created new session ${newSession.sessionId} for IP ${ipAddress}`);
    return newSession;
  }

  /**
   * Core session validation logic
   */
  private async validateSession(sessionId: string | null, ipAddress: string | undefined): Promise<Session | null> {
    if (!sessionId) {
      return null;
    }

    try {
      const session = await SessionProvider.get(sessionId, ipAddress);
      return session;
    } catch (error) {
      this.logger.debug(`Session validation failed for ${sessionId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract session ID from HTTP request
   */
  private extractSessionId(request: Request): string | null {
    // Check session cookie first
    const sessionCookie = request.cookies?.sessionId;
    if (sessionCookie) {
      return sessionCookie;
    }

    // Check Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token.length > 0) {
        return token;
      }
    }

    return null;
  }

  /**
   * Extract session ID from WebSocket
   */
  private extractSessionIdFromSocket(socket: AuthenticatedSocket): string | null {
    // Check handshake auth
    const auth = socket.handshake?.auth;
    if (auth?.sessionId) {
      return auth.sessionId;
    }

    // Check headers for Authorization
    const headers = socket.handshake?.headers;
    if (headers?.authorization && typeof headers.authorization === 'string') {
      const authHeader = headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        if (token.length > 0) {
          return token;
        }
      }
    }

    // Check cookies using secure cookie parser
    const cookieHeader = headers?.cookie;
    if (cookieHeader && typeof cookieHeader === 'string') {
      try {
        const cookies = cookie.parse(cookieHeader);
        if (cookies.sessionId) {
          return cookies.sessionId;
        }
      } catch (error) {
        // Invalid cookie format, continue to other methods
      }
    }

    return null;
  }

  /**
   * Extract session ID from raw request
   */
  private extractSessionIdFromRawRequest(req: RawHttpRequest): string | null {
    // Check query parameters (for socket.io handshake)
    const url = req.url || '';
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const authSessionId = urlParams.get('auth.sessionId');
    if (authSessionId) {
      return authSessionId;
    }

    // Check Authorization header
    const authHeader = req.headers?.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token.length > 0) {
        return token;
      }
    }

    // Check cookies
    const cookieHeader = req.headers?.cookie;
    if (cookieHeader && typeof cookieHeader === 'string') {
      try {
        const cookies = cookie.parse(cookieHeader);
        if (cookies.sessionId) {
          return cookies.sessionId;
        }
      } catch (error) {
        // Invalid cookie format, continue
      }
    }

    return null;
  }

  /**
   * Extract IP address from HTTP request with trusted domain validation
   */
  private async extractIpFromRequest(request: Request): Promise<string | undefined> {
    // Direct connection IP
    const directIp = request.socket?.remoteAddress;
    
    // Check for forwarded headers only if from trusted domain
    const forwardedFor = request.headers['x-forwarded-for'] as string;
    const realIp = request.headers['x-real-ip'] as string;
    
    // If we have forwarded headers, validate the proxy domain
    if ((forwardedFor || realIp) && directIp) {
      const isFromTrustedDomain = await this.isFromTrustedDomain(directIp);
      
      if (isFromTrustedDomain) {
        // Use the first IP in x-forwarded-for chain (original client)
        if (forwardedFor) {
          const firstIp = forwardedFor.split(',')[0].trim();
          return this.isValidIp(firstIp) ? firstIp : directIp;
        }
        
        // Use x-real-ip if available
        if (realIp) {
          return this.isValidIp(realIp) ? realIp : directIp;
        }
      }
    }
    
    // Fall back to direct connection IP or Fastify's processed IP
    return request.ip || directIp;
  }

  /**
   * Extract IP address from WebSocket with trusted domain validation
   */
  private async extractIpFromSocket(socket: AuthenticatedSocket): Promise<string | undefined> {
    // Direct connection IP
    const directIp = socket.conn?.remoteAddress;
    
    // Check for forwarded headers in handshake
    const forwardedFor = socket.handshake?.headers?.['x-forwarded-for'] as string;
    const realIp = socket.handshake?.headers?.['x-real-ip'] as string;
    
    // If we have forwarded headers, validate the proxy domain
    if ((forwardedFor || realIp) && directIp) {
      const isFromTrustedDomain = await this.isFromTrustedDomain(directIp);
      
      if (isFromTrustedDomain) {
        // Use the first IP in x-forwarded-for chain (original client)
        if (forwardedFor) {
          const firstIp = forwardedFor.split(',')[0].trim();
          return this.isValidIp(firstIp) ? firstIp : directIp;
        }
        
        // Use x-real-ip if available
        if (realIp) {
          return this.isValidIp(realIp) ? realIp : directIp;
        }
      }
    }
    
    // Fall back to handshake address or direct connection
    return socket.handshake?.address || directIp;
  }

  /**
   * Extract IP address from raw request with trusted domain validation
   */
  private async extractIpFromRawRequest(req: RawHttpRequest): Promise<string | undefined> {
    // Direct connection IP
    const directIp = req.socket?.remoteAddress || req.connection?.remoteAddress;
    
    // Check for forwarded headers
    const forwardedFor = req.headers?.['x-forwarded-for'] as string;
    const realIp = req.headers?.['x-real-ip'] as string;
    
    // If we have forwarded headers, validate the proxy domain
    if ((forwardedFor || realIp) && directIp) {
      const isFromTrustedDomain = await this.isFromTrustedDomain(directIp);
      
      if (isFromTrustedDomain) {
        // Use the first IP in x-forwarded-for chain (original client)
        if (forwardedFor) {
          const firstIp = forwardedFor.split(',')[0].trim();
          return this.isValidIp(firstIp) ? firstIp : directIp;
        }
        
        // Use x-real-ip if available
        if (realIp) {
          return this.isValidIp(realIp) ? realIp : directIp;
        }
      }
    }
    
    return directIp;
  }

  /**
   * Basic IP address validation
   */
  private isValidIp(ip: string): boolean {
    if (!ip) return false;
    
    // Basic IPv4 validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(ip)) {
      const parts = ip.split('.').map(Number);
      return parts.every(part => part >= 0 && part <= 255);
    }
    
    // Basic IPv6 validation (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    return ipv6Regex.test(ip);
  }

  /**
   * Check if an IP address belongs to a trusted domain
   */
  private async isFromTrustedDomain(ip: string): Promise<boolean> {
    // Check for localhost in development
    if (this.sessionConfig.shouldAllowLocalhost() && this.isLocalhost(ip)) {
      return true;
    }

    // Get hostname via reverse DNS
    const hostname = await this.sessionConfig.getHostnameFromIp(ip);
    if (!hostname) {
      return false;
    }

    // Validate against trusted domain
    return this.sessionConfig.isTrustedDomain(hostname);
  }

  /**
   * Check if IP is localhost
   */
  private isLocalhost(ip: string): boolean {
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  }
}
