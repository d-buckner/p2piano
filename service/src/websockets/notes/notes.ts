import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WsThrottlerGuard } from '../../guards/throttler.guard';
import { WsAuthGuard } from '../../auth/ws-auth.guard';
import { NoteEvents } from './events';
import { broadcastToSubset, defaultWebSocketGatewayOptions } from '../utils';
import { NoteOnDto, NoteOffDto } from '../../dto/ws/note.dto';
import { WsValidationPipe } from '../../pipes/ws-validation.pipe';

@WebSocketGateway(defaultWebSocketGatewayOptions)
export class Notes {
    @Throttle({ default: { limit: 300, ttl: 10000 } })
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(NoteEvents.KEY_DOWN)
    onKeyDown(@MessageBody(new WsValidationPipe()) payload: NoteOnDto, @ConnectedSocket() socket: Socket) {
        broadcastToSubset(socket, payload.targetUserIds, NoteEvents.KEY_DOWN, {
            note: payload.note,
            velocity: payload.velocity,
        });
    }

    @Throttle({ default: { limit: 400, ttl: 10000 } })
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(NoteEvents.KEY_UP)
    onKeyUp(@MessageBody(new WsValidationPipe()) payload: NoteOffDto, @ConnectedSocket() socket: Socket) {
        broadcastToSubset(socket, payload.targetUserIds, NoteEvents.KEY_UP, { note: payload.note });
    }
}
