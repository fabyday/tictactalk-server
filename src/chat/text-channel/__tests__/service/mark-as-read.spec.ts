// src/chat/text-channel/__tests__/service/mark-as-read.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TextChannelService } from '../../text-channel.service';
import { PrismaService } from 'prisma/prisma.service';

describe('TextChannelService - markAsRead', () => {
  let service: TextChannelService;

  const mockPrisma = {
    messageRead: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextChannelService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TextChannelService>(TextChannelService);
  });

  it('should call upsert with correct arguments and return result', async () => {
    const userId = 1;
    const channelId = 10;
    const fakeResult = { id: 999, userId, textChannelId: channelId };

    mockPrisma.messageRead.upsert.mockResolvedValue(fakeResult);

    const result = await service.markAsRead(userId, channelId);

    expect(mockPrisma.messageRead.upsert).toHaveBeenCalledWith({
      where: {
        userId_textChannelId: {
          userId,
          textChannelId: channelId,
        },
      },
      update: {
        lastReadAt: expect.any(Date),
      },
      create: {
        userId,
        textChannelId: channelId,
        lastReadAt: expect.any(Date),
      },
    });

    expect(result).toBe(fakeResult);
  });
});
