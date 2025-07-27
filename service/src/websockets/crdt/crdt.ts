import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { WsThrottlerGuard } from '../../guards/throttler.guard';
import { WsValidationPipe } from '../../pipes/ws-validation.pipe';
import { broadcastToSubset, getWebSocketGatewayOptions } from '../utils';
import { CrdtEvents } from './events';
import type { CrdtMessageDto } from '../../dto/ws/crdt.dto';
import type { Socket } from 'socket.io';


@WebSocketGateway(getWebSocketGatewayOptions())
export class Crdt {
    @Throttle({ default: { limit: 100, ttl: 10000 } }) // Reasonable limit for CRDT sync messages
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(CrdtEvents.AUTOMERGE_PROTOCOL)
    async onAutomergeProtocol(@MessageBody(new WsValidationPipe()) payload: CrdtMessageDto, @ConnectedSocket() socket: Socket) {
        // Extract targetUserIds and forward the rest of the payload
        const { targetUserIds, ...crdtData } = payload;
        
        // broadcastToSubset will add userId field, but client expects senderId
        // We'll let broadcastToSubset add userId, then the client can map it
        await broadcastToSubset(socket, targetUserIds, CrdtEvents.AUTOMERGE_PROTOCOL, crdtData);
    }
}
