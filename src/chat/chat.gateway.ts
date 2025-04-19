import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TextChannelService } from './text-channel/text-channel.service';
import { SendMessageDto } from './dto/send-message.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: true,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly textChannelService: TextChannelService,
    private readonly config: ConfigService,
  ) {}

  handleConnection(socket: Socket) {
    console.log(`Socket connected: ${socket.id}`);
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log('❌ token not found - disconnecting');
      return socket.disconnect(true);
    }

    try {
      const payload = jwt.verify(
        token,
        this.config.get<string>('JWT_SECRET'),
      ) as any;
      socket.data.userId = payload.sub || payload.id;

      console.log(`✅ authenticated user: ${socket.data.userId}`);
    } catch (err) {
      console.log('❌ token verification error:', err.message);
      return socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    console.log(`Socket disconnected: ${socket.id}`);
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() messageId: number,
    @ConnectedSocket() socket: Socket,
  ) {
    const userId = socket.data.userId;

    const deleted = await this.textChannelService.deleteMessage(
      messageId,
      userId,
    );

    this.server.to(`channel-${deleted.textChannelId}`).emit('messageDeleted', {
      messageId: deleted.id,
    });
  }
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() channelId: number,
    @ConnectedSocket() socket: Socket,
  ) {
    const userId = socket.data.userId;

    this.server.to(`channel-${channelId}`).emit('userTyping', {
      userId,
      channelId,
    });
  }

  @SubscribeMessage('joinChannel')
  handleJoinChannel(
    @MessageBody() channelId: number,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(`channel-${channelId}`);
    socket.emit('joinedChannel', channelId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const message = await this.textChannelService.sendMessage({
      ...data,
      userId: socket.data.userId, // 인증 시스템과 연결 시
    });

    this.server.to(`channel-${data.channelId}`).emit('newMessage', message);
  }
}
