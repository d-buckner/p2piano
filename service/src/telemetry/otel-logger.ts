import { logs } from '@opentelemetry/api-logs';
import { StructuredLogger } from './structured-logger';
import type { LogLevel } from '@nestjs/common';
import type { AnyValueMap} from '@opentelemetry/api-logs';


type WriteStreamType = 'stdout' | 'stderr';

interface SeverityMapping {
  number: number;
  text: string;
}

/**
 * NestJS logger that extends StructuredLogger to forward logs to OpenTelemetry.
 * 
 * Outputs clean formatted logs while sending telemetry data to the configured OTLP endpoint.
 */
export class OtelLogger extends StructuredLogger {
  private readonly otelLogger = logs.getLogger('p2piano-service');

  protected printMessages(
    messages: unknown[],
    context?: string,
    logLevel?: LogLevel,
    writeStreamType?: WriteStreamType,
  ): void {
    // Use parent's clean formatting for console output
    super.printMessages(messages, context, logLevel, writeStreamType);

    // Send to OpenTelemetry
    if (messages.length > 0) {
      const message = messages.join(' ');
      const severity = this.mapLogLevelToSeverity(logLevel);
      
      const attributes: AnyValueMap = {
        'service.name': 'p2piano-service',
        'log.context': context,
        'log.level': logLevel?.toLowerCase(),
      };
      
      this.otelLogger.emit({
        severityNumber: severity.number,
        severityText: severity.text,
        body: message,
        attributes,
      });
    }
  }

  private mapLogLevelToSeverity(logLevel?: LogLevel): SeverityMapping {
    switch (logLevel?.toLowerCase()) {
      case 'error':
        return { number: 17, text: 'ERROR' };
      case 'warn':
        return { number: 13, text: 'WARN' };
      case 'log':
        return { number: 9, text: 'INFO' };
      case 'debug':
        return { number: 5, text: 'DEBUG' };
      case 'verbose':
        return { number: 1, text: 'TRACE' };
      default:
        return { number: 9, text: 'INFO' };
    }
  }
}
