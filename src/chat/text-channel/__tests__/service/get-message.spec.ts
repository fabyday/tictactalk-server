// src/chat/text-channel/__tests__/service/get-messages.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TextChannelService } from '../../text-channel.service';
import { PrismaService } from 'prisma/prisma.service';

describe('TextChannelService - getMessages', () => {
  let service: TextChannelService;

  const mockPrisma = {
    messageRead: {
      findUnique: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
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

    // markAsRead도 모킹해줌
    service['markAsRead'] = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch messages after lastReadAt and call markAsRead', async () => {
    const userId = 1;
    const channelId = 10;
    const lastReadAt = new Date('2024-01-01T00:00:00Z');
    const messages = [{ id: 1 }, { id: 2 }];

    mockPrisma.messageRead.findUnique.mockResolvedValue({
      lastReadAt,
    });
    mockPrisma.message.findMany.mockResolvedValue(messages);

    const result = await service.getMessages(userId, channelId);

    expect(mockPrisma.messageRead.findUnique).toHaveBeenCalledWith({
      where: {
        userId_textChannelId: {
          userId,
          textChannelId: channelId,
        },
      },
    });

    expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
      where: {
        textChannelId: channelId,
        createdAt: {
          gt: lastReadAt,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      skip: 0,
      take: 50,
      include: {
        user: true,
      },
    });

    expect(service['markAsRead']).toHaveBeenCalledWith(userId, channelId);
    expect(result).toEqual(messages);
  });

  it('should use Date(0) if no read record exists', async () => {
    mockPrisma.messageRead.findUnique.mockResolvedValue(null);
    mockPrisma.message.findMany.mockResolvedValue([]);

    const result = await service.getMessages(1, 10);

    expect(mockPrisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({
            gt: expect.any(Date),
          }),
        }),
      }),
    );

    expect(result).toEqual([]);
  });

  it('should apply skip and take pagination', async () => {
    mockPrisma.messageRead.findUnique.mockResolvedValue(null);
    mockPrisma.message.findMany.mockResolvedValue([]);

    await service.getMessages(1, 10, 20, 10);

    expect(mockPrisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });
});
