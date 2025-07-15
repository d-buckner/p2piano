import type { RawHttpRequest } from '../types/raw-request';
import type { Request } from '../types/request';
import type { AuthenticatedSocket } from '../types/socket';
import type { Socket } from 'socket.io';

/**
 * Extracts IP address from x-forwarded-for header if present
 * @param forwardedFor - The x-forwarded-for header value
 * @returns The extracted IP address or undefined
 */
function extractFromForwardedFor(forwardedFor: string | string[] | undefined): string | undefined {
  if (!forwardedFor) {
    return undefined;
  }
  
  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0];
  }
  
  // Handle comma-separated list of IPs
  return forwardedFor.split(',')[0]?.trim();
}

/**
 * Extract IP address from HTTP request
 * Only uses x-forwarded-for header as per security requirements
 */
export function extractIpFromRequest(request: Request): string | undefined {
  return extractFromForwardedFor(request.headers['x-forwarded-for']);
}

/**
 * Extract IP address from WebSocket
 * Only uses x-forwarded-for header as per security requirements
 */
export function extractIpFromSocket(socket: AuthenticatedSocket | Socket): string | undefined {
  const forwardedFor = socket.handshake?.headers?.['x-forwarded-for'];
  return extractFromForwardedFor(forwardedFor);
}

/**
 * Extract IP address from raw HTTP request
 * Only uses x-forwarded-for header as per security requirements
 */
export function extractIpFromRawRequest(req: RawHttpRequest): string | undefined {
  return extractFromForwardedFor(req.headers?.['x-forwarded-for']);
}
