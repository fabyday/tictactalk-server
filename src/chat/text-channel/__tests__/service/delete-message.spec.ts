// src/chat/text-channel/__tests__/service/delete-message.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TextChannelService } from '../../text-channel.service';
import { PrismaService } from 'prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TextChannelService - deleteMessage', () => {
  let service: TextChannelService;

  const mockPrisma = {
    message: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextChannelService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TextChannelService>(TextChannelService);
  });

  it('should delete the message if user is the owner', async () => {
    const userId = 1;
    const messageId = 123;
    const fakeMessage = { id: messageId, userId, textChannelId: 99 };

    mockPrisma.message.findUnique.mockResolvedValue(fakeMessage);
    mockPrisma.message.delete.mockResolvedValue(fakeMessage);

    const result = await service.deleteMessage(messageId, userId);

    expect(mockPrisma.message.findUnique).toHaveBeenCalledWith({
      where: { id: messageId },
      include: { user: true },
    });

    expect(mockPrisma.message.delete).toHaveBeenCalledWith({
      where: { id: messageId },
    });

    expect(result).toEqual(fakeMessage);
  });

  it('should throw NotFoundException if message does not exist', async () => {
    mockPrisma.message.findUnique.mockResolvedValue(null);

    await expect(service.deleteMessage(123, 1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException if user is not the owner', async () => {
    const message = { id: 123, userId: 999 }; // 다른 유저의 메시지
    mockPrisma.message.findUnique.mockResolvedValue(message);

    await expect(service.deleteMessage(123, 1)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
