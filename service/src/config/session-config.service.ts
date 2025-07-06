import { Injectable } from '@nestjs/common';
import ConfigProvider from './ConfigProvider';


export interface SessionSecurityConfig {
  trustedDomain: string | null;
  enableIpValidation: boolean;
  cookieMaxAge: number;
  sessionCacheTtl: number;
}

/**
 * Session configuration service with domain-based proxy validation.
 * 
 * Usage:
 * 
 * 1. Domain-based validation (recommended):
 *    DOMAIN="myapp.cloudflareaccess.com"  # Trust requests from this specific domain
 * 
 *    Examples:
 *    - CloudFlare: "myapp.cloudflareaccess.com"
 *    - AWS ALB: "my-alb-123.us-east-1.elb.amazonaws.com"
 *    - Custom: "proxy.mycompany.com"
 * 
 * 2. Development defaults (no configuration):
 *    Uses localhost for local development
 * 
 * 3. Production (no configuration):
 *    No trusted proxies - all forwarded headers ignored for security
 * 
 * Security:
 * - Only accepts x-forwarded-for headers from the specified domain
 * - Uses reverse DNS lookup to validate proxy hostname
 * - Production requires explicit DOMAIN configuration
 */

@Injectable()
export class SessionConfigService {
  private readonly config: SessionSecurityConfig;

  constructor() {
    this.config = {
      trustedDomain: process.env.DOMAIN || null,
      enableIpValidation: ConfigProvider.isProduction(),
      cookieMaxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sessionCacheTtl: 1000 * 60 * 15, // 15 minutes
    };
  }

  getTrustedDomain(): string | null {
    return this.config.trustedDomain;
  }

  isIpValidationEnabled(): boolean {
    return this.config.enableIpValidation;
  }

  getCookieMaxAge(): number {
    return this.config.cookieMaxAge;
  }

  getSessionCacheTtl(): number {
    return this.config.sessionCacheTtl;
  }

  getFullConfig(): SessionSecurityConfig {
    return { ...this.config };
  }

  /**
   * Validates if a domain/hostname is trusted
   */
  isTrustedDomain(hostname: string): boolean {
    const trustedDomain = this.getTrustedDomain();
    if (!trustedDomain || !hostname) {
      return false;
    }
    
    // Exact match for the trusted domain
    return hostname.toLowerCase() === trustedDomain.toLowerCase();
  }

  /**
   * Check if we should use localhost fallback (development only)
   */
  shouldAllowLocalhost(): boolean {
    return !ConfigProvider.isProduction() && !this.config.trustedDomain;
  }

  /**
   * Get hostname from IP address using reverse DNS lookup
   * Note: This is a simplified version. In production, you might want
   * to implement caching and proper error handling.
   */
  async getHostnameFromIp(ip: string): Promise<string | null> {
    try {
      const dns = await import('dns');
      const { promisify } = await import('util');
      const reverseLookup = promisify(dns.reverse);
      
      const hostnames = await reverseLookup(ip);
      return hostnames[0] || null;
    } catch {
      // Reverse DNS failed - this is normal for many IPs
      return null;
    }
  }
}
