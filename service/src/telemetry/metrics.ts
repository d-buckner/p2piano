import { metrics } from '@opentelemetry/api';

/**
 * Application metrics for p2piano service.
 * 
 * Provides structured metrics collection for key business events
 * and operational data that get exported to the OTEL endpoint.
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
}

export const applicationMetrics = new ApplicationMetrics();
