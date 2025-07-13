import { UseGuards, Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { SignalThrottlerGuard } from '../../guards/signalthrottler.guard';
import { WsValidationPipe } from '../../pipes/ws-validation.pipe';
import { getErrorMessage } from '../../utils/ErrorUtils';
import { getWebSocketGatewayOptions, extractSessionIdFromSocket, sendTo } from '../utils';
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

      const { signalData } = payload;
      // Direct room targeting - target user's personal room (sessionId)
      // Redis adapter handles cross-server routing automatically
      sendTo(socket, payload.userId, SignalEvents.SIGNAL, {
        signalData,
        userId,
      });

      this.logger.debug(`WebRTC signal ${signalData.type} routed from ${userId} to ${payload.userId}`);
    } catch (error) {
      this.logger.error(`Error processing WebRTC signal: ${getErrorMessage(error)}`);
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
