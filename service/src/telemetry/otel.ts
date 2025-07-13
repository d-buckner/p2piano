import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter as LogExporterGRPC } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPLogExporter as LogExporterHTTP } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter as MetricExporterGRPC } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPMetricExporter as MetricExporterHTTP } from '@opentelemetry/exporter-metrics-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { NoopSpanProcessor } from '@opentelemetry/sdk-trace-base';
import ConfigProvider from '../config/ConfigProvider';


let sdk: NodeSDK | null = null;

/**
 * Initializes OpenTelemetry metrics and logs if OTEL endpoint is configured.
 * 
 * Sets up automatic instrumentation for HTTP requests, database queries,
 * and other NestJS/Node.js operations, sending metrics and logs to the
 * configured OTLP endpoint.
 */
export function initializeOtelemetry(): void {
  if (!ConfigProvider.isOtelEnabled()) {
    return;
  }

  // Enable OTEL diagnostic logging for export errors
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

  const endpoint = ConfigProvider.getOtelEndpoint();
  const protocol = ConfigProvider.getOtelProtocol();

  const metricsExporter = protocol === 'grpc' 
    ? new MetricExporterGRPC({ url: endpoint })
    : new MetricExporterHTTP({ url: endpoint });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricsExporter,
    exportIntervalMillis: 5000, // Export every 5 seconds for testing
  });

  const logsExporter = protocol === 'grpc' 
    ? new LogExporterGRPC({ url: endpoint })
    : new LogExporterHTTP({ url: endpoint });

  const logProcessor = new BatchLogRecordProcessor(logsExporter);

  sdk = new NodeSDK({
    metricReader,
    logRecordProcessor: logProcessor,
    spanProcessors: [new NoopSpanProcessor()],
    instrumentations: [getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    })],
  });

  sdk.start();
}

/**
 * Gracefully shuts down OpenTelemetry SDK.
 * Should be called during application shutdown.
 */
export async function shutdownOtelemetry(): Promise<void> {
  if (sdk) {
    try {
      await sdk.shutdown();
      console.log('OpenTelemetry shutdown successfully');
    } catch (error) {
      console.error('Error shutting down OpenTelemetry:', error);
    }
  }
}
