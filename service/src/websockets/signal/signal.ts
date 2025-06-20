import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { SignalThrottlerGuard } from '../../guards/signalthrottler.guard';
import { SignalEvents } from './events';
import { SignalPayload } from './payloads';
import { defaultWebSocketGatewayOptions, getSocketSessionId } from '../utils';
import SessionRegistry from '../SessionRegistry';

import type { Socket } from 'socket.io';

@WebSocketGateway(defaultWebSocketGatewayOptions)
export class Signal {
  @UseGuards(SignalThrottlerGuard) 
  @SubscribeMessage(SignalEvents.SIGNAL)
  onSignal(@MessageBody() payload: SignalPayload, @ConnectedSocket() socket: Socket) {
    const userId = getSocketSessionId(socket);
    const socketId = SessionRegistry.getSocket(payload.userId)?.id;
    socket.to(socketId).emit(SignalEvents.SIGNAL, {
      signalData: payload.signalData,
      userId,
    });
  }
}
