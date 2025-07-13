import { metrics } from '@opentelemetry/api';

/**
 * Application metrics for p2piano service.
 * 
 * Provides structured metrics collection for key business events,
 * system health monitoring, and operational data that get exported 
 * to the OTEL endpoint.
 */
class ApplicationMetrics {
  private readonly meter = metrics.getMeter('p2piano-service');
  
  private readonly roomCreationsCounter = this.meter.createCounter('rooms_created_total', {
    description: 'Total number of rooms created',
  });
  
  private readonly roomCreationDurationHistogram = this.meter.createHistogram('room_creation_duration_ms', {
    description: 'Duration of room creation operations in milliseconds',
  });

  private readonly usersPerRoomGauge = this.meter.createUpDownCounter('users_per_room', {
    description: 'Number of users in each room',
  });

  // WebSocket health metrics
  private readonly websocketDisconnectionsCounter = this.meter.createCounter('websocket_disconnections_total', {
    description: 'Total WebSocket disconnections by reason',
  });

  private readonly websocketConnectionsGauge = this.meter.createUpDownCounter('websocket_connections_active', {
    description: 'Number of active WebSocket connections',
  });

  private readonly websocketMessageRateCounter = this.meter.createCounter('websocket_messages_total', {
    description: 'Total WebSocket messages by event type',
  });

  // Error tracking metrics
  private readonly applicationErrorsCounter = this.meter.createCounter('application_errors_total', {
    description: 'Total application errors by type and source',
  });

  private readonly rateLimitViolationsCounter = this.meter.createCounter('rate_limit_violations_total', {
    description: 'Total rate limit violations by endpoint and user',
  });

  // Performance metrics
  private readonly requestDurationHistogram = this.meter.createHistogram('http_request_duration_ms', {
    description: 'HTTP request duration in milliseconds',
  });

  // System resource metrics
  private readonly memoryUsageGauge = this.meter.createObservableGauge('system_memory_usage_bytes', {
    description: 'Memory usage by component in bytes',
  });

  private readonly cpuUsageGauge = this.meter.createObservableGauge('system_cpu_usage_percent', {
    description: 'CPU usage percentage',
  });

  constructor() {
    // Set up observable callbacks for system metrics
    this.memoryUsageGauge.addCallback((observableResult) => {
      const memUsage = process.memoryUsage();
      observableResult.observe(memUsage.heapUsed, { component: 'heap_used' });
      observableResult.observe(memUsage.heapTotal, { component: 'heap_total' });
      observableResult.observe(memUsage.rss, { component: 'rss' });
      observableResult.observe(memUsage.external, { component: 'external' });
    });

    this.cpuUsageGauge.addCallback((observableResult) => {
      const cpuUsage = process.cpuUsage();
      observableResult.observe(cpuUsage.user / 1000, { type: 'user_ms' });
      observableResult.observe(cpuUsage.system / 1000, { type: 'system_ms' });
    });
  }

  /**
   * Records a successful room creation event.
   */
  recordRoomCreated(durationMs: number): void {
    this.roomCreationsCounter.add(1, { status: 'success' });
    this.roomCreationDurationHistogram.record(durationMs);
  }

  /**
   * Records a failed room creation event.
   */
  recordRoomCreationFailed(durationMs: number): void {
    this.roomCreationsCounter.add(1, { status: 'error' });
    this.roomCreationDurationHistogram.record(durationMs);
  }

  /**
   * Records a user joining a room.
   */
  recordUserJoinedRoom(roomId: string): void {
    this.usersPerRoomGauge.add(1, { room_id: roomId });
  }

  /**
   * Records a user leaving a room.
   */
  recordUserLeftRoom(roomId: string): void {
    this.usersPerRoomGauge.add(-1, { room_id: roomId });
  }

  /**
   * Records a WebSocket disconnection with reason.
   */
  recordWebSocketDisconnection(reason: string, roomId?: string): void {
    const attributes: Record<string, string> = { reason };
    if (roomId) attributes.room_id = roomId;
    this.websocketDisconnectionsCounter.add(1, attributes);
  }

  /**
   * Records a WebSocket connection.
   */
  recordWebSocketConnection(roomId?: string): void {
    const attributes: Record<string, string> = {};
    if (roomId) attributes.room_id = roomId;
    this.websocketConnectionsGauge.add(1, attributes);
  }

  /**
   * Records a WebSocket disconnection.
   */
  recordWebSocketDisconnected(roomId?: string): void {
    const attributes: Record<string, string> = {};
    if (roomId) attributes.room_id = roomId;
    this.websocketConnectionsGauge.add(-1, attributes);
  }

  /**
   * Records a WebSocket message.
   */
  recordWebSocketMessage(eventType: string, sessionId: string): void {
    this.websocketMessageRateCounter.add(1, { event_type: eventType, session_id: sessionId });
  }

  /**
   * Records an application error.
   */
  recordApplicationError(errorType: string, source: string, message?: string): void {
    const attributes: Record<string, string> = { error_type: errorType, source };
    if (message) attributes.message = message;
    this.applicationErrorsCounter.add(1, attributes);
  }

  /**
   * Records a rate limit violation.
   */
  recordRateLimitViolation(endpoint: string, userId?: string): void {
    const attributes: Record<string, string> = { endpoint };
    if (userId) attributes.user_id = userId;
    this.rateLimitViolationsCounter.add(1, attributes);
  }

  /**
   * Records HTTP request duration.
   */
  recordRequestDuration(durationMs: number, method: string, endpoint: string, statusCode: number): void {
    this.requestDurationHistogram.record(durationMs, { 
      method, 
      endpoint, 
      status_code: statusCode.toString() 
    });
  }
}

export const applicationMetrics = new ApplicationMetrics();
