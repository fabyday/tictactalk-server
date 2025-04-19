// src/chat/text-channel/text-channel.service.ts

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTextChannelDto } from './dto/create-text-channel.dto';

@Injectable()
export class TextChannelService {
  constructor(private prisma: PrismaService) {}

  async createChannel(userId: number, dto: CreateTextChannelDto) {
    return this.prisma.textChannel.create({
      data: {
        name: dto.name,
        communityId: dto.communityId,
        categoryId: dto.categoryId,
      },
    });
  }

  async sendMessage(data: {
    channelId: number;
    userId: number;
    content: string;
  }) {
    return this.prisma.message.create({
      data: {
        content: data.content,
        textChannelId: data.channelId,
        userId: data.userId,
      },
      include: {
        user: true,
      },
    });
  }
  async deleteMessage(messageId: number, userId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { user: true },
    });

    if (!message) throw new NotFoundException('Cannot Find message');

    const isOwner = message.userId === userId;
    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to delete this message.',
      );
    }

    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }

  async getMessages(userId: number, channelId: number, skip = 0, take = 50) {
    const read = await this.prisma.messageRead.findUnique({
      where: {
        userId_textChannelId: {
          userId,
          textChannelId: channelId,
        },
      },
    });

    const lastReadAt = read?.lastReadAt ?? new Date(0);

    const messages = await this.prisma.message.findMany({
      where: {
        textChannelId: channelId,
        createdAt: {
          gt: lastReadAt,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      skip,
      take,
      include: {
        user: true,
      },
    });

    await this.markAsRead(userId, channelId);
    return messages;
  }

  async markAsRead(userId: number, channelId: number) {
    return this.prisma.messageRead.upsert({
      where: {
        userId_textChannelId: {
          userId,
          textChannelId: channelId,
        },
      },
      update: {
        lastReadAt: new Date(),
      },
      create: {
        userId,
        textChannelId: channelId,
        lastReadAt: new Date(),
      },
    });
  }
}
