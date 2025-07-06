import { UseGuards, Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { SignalThrottlerGuard } from '../../guards/signalthrottler.guard';
import { WsValidationPipe } from '../../pipes/ws-validation.pipe';
import SessionRegistry from '../SessionRegistry';
import { defaultWebSocketGatewayOptions, getSocketSessionId } from '../utils';
import { SignalEvents } from './events';
import type { SignalPayloadDto } from '../../dto/ws/signal.dto';
import type { AuthenticatedSocket } from '../../types/socket';


@WebSocketGateway(defaultWebSocketGatewayOptions)
export class Signal {
  private readonly logger = new Logger(Signal.name);

  @UseGuards(SignalThrottlerGuard) 
  @SubscribeMessage(SignalEvents.SIGNAL)
  onSignal(@MessageBody(new WsValidationPipe()) payload: SignalPayloadDto, @ConnectedSocket() socket: AuthenticatedSocket) {
    try {
      const userId = getSocketSessionId(socket);
      if (!userId) {
        this.logger.warn('Signal received from unauthenticated socket', { socketId: socket.id });
        return;
      }

      const targetSocket = SessionRegistry.getSocket(payload.userId);
      if (!targetSocket) {
        this.logger.debug('Target user not found for signal', { 
          from: userId, 
          to: payload.userId,
          signalType: payload.signalData.type 
        });
        return;
      }

      socket.to(targetSocket.id).emit(SignalEvents.SIGNAL, {
        signalData: payload.signalData,
        userId,
      });

      this.logger.debug('WebRTC signal routed successfully', {
        from: userId,
        to: payload.userId,
        signalType: payload.signalData.type,
        targetSocketId: targetSocket.id
      });

    } catch (error) {
      this.logger.error('Error processing WebRTC signal', {
        error: error.message,
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
