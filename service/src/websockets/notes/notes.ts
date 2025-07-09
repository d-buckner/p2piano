import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { WsThrottlerGuard } from '../../guards/throttler.guard';
import { WsValidationPipe } from '../../pipes/ws-validation.pipe';
import { broadcastToSubset, getWebSocketGatewayOptions } from '../utils';
import { NoteEvents } from './events';
import type { NoteOnDto, NoteOffDto } from '../../dto/ws/note.dto';
import type { Socket } from 'socket.io';


@WebSocketGateway(getWebSocketGatewayOptions())
export class Notes {
    @Throttle({ default: { limit: 1000, ttl: 10000 } }) // 100 notes/second allows for fast passages, glissandos, and complex chords
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(NoteEvents.KEY_DOWN)
    async onKeyDown(@MessageBody(new WsValidationPipe()) payload: NoteOnDto, @ConnectedSocket() socket: Socket) {
        await broadcastToSubset(socket, payload.targetUserIds, NoteEvents.KEY_DOWN, {
            note: payload.note,
            velocity: payload.velocity,
        });
    }

    @Throttle({ default: { limit: 1000, ttl: 10000 } }) // Match KEY_DOWN limit - every note down should have a corresponding note up
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(NoteEvents.KEY_UP)
    onKeyUp(@MessageBody(new WsValidationPipe()) payload: NoteOffDto, @ConnectedSocket() socket: Socket) {
        broadcastToSubset(socket, payload.targetUserIds, NoteEvents.KEY_UP, { note: payload.note });
    }
}
