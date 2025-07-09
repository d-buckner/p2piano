import { UseGuards, Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { SignalThrottlerGuard } from '../../guards/signalthrottler.guard';
import { WsValidationPipe } from '../../pipes/ws-validation.pipe';
import { getErrorMessage } from '../../utils/ErrorUtils';
import { getWebSocketGatewayOptions, extractSessionIdFromSocket } from '../utils';
import { SignalEvents } from './events';
import type { SignalPayloadDto } from '../../dto/ws/signal.dto';
import type { Socket } from 'socket.io';


@WebSocketGateway(getWebSocketGatewayOptions())
export class Signal {
  private readonly logger = new Logger(Signal.name);

  @UseGuards(SignalThrottlerGuard) 
  @SubscribeMessage(SignalEvents.SIGNAL)
  async onSignal(@MessageBody(new WsValidationPipe()) payload: SignalPayloadDto, @ConnectedSocket() socket: Socket) {
    try {
      const userId = extractSessionIdFromSocket(socket);
      if (!userId) {
        this.logger.warn('Signal received from unauthenticated socket', { socketId: socket.id });
        return;
      }

      // Direct room targeting - target user's personal room (sessionId)
      // Redis adapter handles cross-server routing automatically
      socket.to(payload.userId).emit(SignalEvents.SIGNAL, {
        signalData: payload.signalData,
        userId,
      });

      this.logger.debug('WebRTC signal routed to user room', {
        from: userId,
        to: payload.userId,
        signalType: payload.signalData.type
      });

    } catch (error) {
      this.logger.error('Error processing WebRTC signal', {
        error: getErrorMessage(error),
        socketId: socket.id,
        targetUserId: payload.userId,
        signalType: payload.signalData.type
      });
      
      socket.emit('exception', {
        status: 'error',
        code: 500,
        message: 'Failed to process WebRTC signal',
        event: SignalEvents.SIGNAL,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
