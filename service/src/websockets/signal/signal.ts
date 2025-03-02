import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WsThrottlerGuard } from '../../guards/throttler.guard';
import { SignalEvents } from './events';
import { SignalPayload } from './payloads';
import { defaultWebSocketGatewayOptions, getSocketSessionId } from '../utils';
import SessionRegistry from '../SessionRegistry';

import type { Socket } from 'socket.io';

@WebSocketGateway(defaultWebSocketGatewayOptions)
export class Signal {
  @Throttle(10, 30)
  @UseGuards(WsThrottlerGuard)
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
