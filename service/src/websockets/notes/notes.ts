import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { NoteOffPayload, NoteOnPayload } from './payloads';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WsThrottlerGuard } from '../../guards/throttler.guard';
import { NoteEvents } from './events';
import { broadcastToSubset, defaultWebSocketGatewayOptions } from '../utils';

@WebSocketGateway(defaultWebSocketGatewayOptions)
export class Notes {
    @Throttle(100, 10)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(NoteEvents.KEY_DOWN)
    onKeyDown(@MessageBody() payload: NoteOnPayload, @ConnectedSocket() socket: Socket) {
        broadcastToSubset(socket, payload.targetUserIds, NoteEvents.KEY_DOWN, {
            midi: payload.midi,
            velocity: payload.velocity,
        });
    }

    @Throttle(150, 10)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(NoteEvents.KEY_UP)
    onKeyUp(@MessageBody() payload: NoteOffPayload, @ConnectedSocket() socket: Socket) {
        broadcastToSubset(socket, payload.targetUserIds, NoteEvents.KEY_UP, { midi: payload.midi });
    }
}
