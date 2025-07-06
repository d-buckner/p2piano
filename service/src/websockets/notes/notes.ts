import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WsThrottlerGuard } from '../../guards/throttler.guard';
import { NoteEvents } from './events';
import { broadcastToSubset, getWebSocketGatewayOptions } from '../utils';
import { NoteOnDto, NoteOffDto } from '../../dto/ws/note.dto';
import { WsValidationPipe } from '../../pipes/ws-validation.pipe';
import { AuthenticatedSocket } from '../../types/socket';

@WebSocketGateway(getWebSocketGatewayOptions())
export class Notes {
    @Throttle({ default: { limit: 1000, ttl: 10000 } }) // 100 notes/second allows for fast passages, glissandos, and complex chords
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(NoteEvents.KEY_DOWN)
    onKeyDown(@MessageBody(new WsValidationPipe()) payload: NoteOnDto, @ConnectedSocket() socket: AuthenticatedSocket) {
        broadcastToSubset(socket, payload.targetUserIds, NoteEvents.KEY_DOWN, {
            note: payload.note,
            velocity: payload.velocity,
        });
    }

    @Throttle({ default: { limit: 1000, ttl: 10000 } }) // Match KEY_DOWN limit - every note down should have a corresponding note up
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(NoteEvents.KEY_UP)
    onKeyUp(@MessageBody(new WsValidationPipe()) payload: NoteOffDto, @ConnectedSocket() socket: AuthenticatedSocket) {
        broadcastToSubset(socket, payload.targetUserIds, NoteEvents.KEY_UP, { note: payload.note });
    }
}
