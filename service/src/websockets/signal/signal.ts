import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { SignalThrottlerGuard } from '../../guards/signalthrottler.guard';
import { WsAuthGuard } from '../../auth/ws-auth.guard';
import { SignalEvents } from './events';
import { defaultWebSocketGatewayOptions, getSocketSessionId } from '../utils';
import SessionRegistry from '../SessionRegistry';
import { SignalPayloadDto } from '../../dto/ws/signal.dto';
import { WsValidationPipe } from '../../pipes/ws-validation.pipe';

import type { Socket } from 'socket.io';

@WebSocketGateway(defaultWebSocketGatewayOptions)
export class Signal {
  @UseGuards(SignalThrottlerGuard) 
  @SubscribeMessage(SignalEvents.SIGNAL)
  onSignal(@MessageBody(new WsValidationPipe()) payload: SignalPayloadDto, @ConnectedSocket() socket: Socket) {
    const userId = getSocketSessionId(socket);
    const socketId = SessionRegistry.getSocket(payload.userId)?.id;
    socket.to(socketId).emit(SignalEvents.SIGNAL, {
      signalData: payload.signalData,
      userId,
    });
  }
}
