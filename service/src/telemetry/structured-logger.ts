import { ConsoleLogger } from '@nestjs/common';
import type { LogLevel } from '@nestjs/common';

/**
 * Structured console logger that outputs clean formatted logs with timestamps but without process info.
 * Inherits all color formatting from NestJS ConsoleLogger.
 * 
 * Outputs in format: 2025-07-13T12:47:09.123Z LOG [Context] message
 */
export class StructuredLogger extends ConsoleLogger {
  protected formatMessage(
    logLevel: LogLevel,
    message: unknown,
    pidMessage: string,
    formattedLogLevel: string,
    contextMessage: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _timestampDiff: string,
  ): string {
    // Include timestamp but skip pid, keep colored log level from parent
    const timestamp = new Date().toISOString();
    return `${timestamp} ${formattedLogLevel}${contextMessage} ${message}`;
  }
}
