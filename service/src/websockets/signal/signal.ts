import { UseGuards, Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { SignalThrottlerGuard } from '../../guards/signalthrottler.guard';
import { WsValidationPipe } from '../../pipes/ws-validation.pipe';
import { getErrorMessage } from '../../utils/ErrorUtils';
import SessionRegistry from '../SessionRegistry';
import { getWebSocketGatewayOptions, getSocketSessionId } from '../utils';
import { SignalEvents } from './events';
import type { SignalPayloadDto } from '../../dto/ws/signal.dto';
import type { AuthenticatedSocket } from '../../types/socket';


@WebSocketGateway(getWebSocketGatewayOptions())
export class Signal {
  private readonly logger = new Logger(Signal.name);

  @UseGuards(SignalThrottlerGuard) 
  @SubscribeMessage(SignalEvents.SIGNAL)
  async onSignal(@MessageBody(new WsValidationPipe()) payload: SignalPayloadDto, @ConnectedSocket() socket: AuthenticatedSocket) {
    try {
      const userId = getSocketSessionId(socket);
      if (!userId) {
        this.logger.warn('Signal received from unauthenticated socket', { socketId: socket.id });
        return;
      }

      // Get target socket info from Redis
      const socketMetadata = await SessionRegistry.getSocketMetadata(payload.userId);
      if (!socketMetadata) {
        this.logger.debug('Target user not found for signal', { 
          from: userId, 
          to: payload.userId,
          signalType: payload.signalData.type 
        });
        return;
      }

      if (socketMetadata.serverId === SessionRegistry.getServerId()) {
        // Target is on this server (local)
        socket.to(socketMetadata.socketId).emit(SignalEvents.SIGNAL, {
          signalData: payload.signalData,
          userId,
        });

        this.logger.debug('WebRTC signal routed locally', {
          from: userId,
          to: payload.userId,
          signalType: payload.signalData.type,
          targetSocketId: socketMetadata.socketId
        });
      } else {
        // Target is on another server - use Socket.IO adapter for cross-server communication
        socket.to(payload.userId).emit(SignalEvents.SIGNAL, {
          signalData: payload.signalData,
          userId,
        });

        this.logger.debug('WebRTC signal routed cross-server', {
          from: userId,
          to: payload.userId,
          signalType: payload.signalData.type,
          targetServerId: socketMetadata.serverId,
          targetSocketId: socketMetadata.socketId
        });
      }

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
