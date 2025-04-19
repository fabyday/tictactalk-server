// src/chat/text-channel/__tests__/service/send-message.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TextChannelService } from '../../text-channel.service';
import { PrismaService } from 'prisma/prisma.service';

describe('TextChannelService - sendMessage', () => {
  let service: TextChannelService;

  const mockPrisma = {
    message: {
      create: jest.fn(),
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

  it('should create a message with correct data and include user', async () => {
    const input = {
      userId: 1,
      channelId: 42,
      content: 'hello world',
    };

    const fakeMessage = {
      id: 999,
      content: input.content,
      userId: input.userId,
      textChannelId: input.channelId,
      user: { id: 1, username: 'tester' },
    };

    mockPrisma.message.create.mockResolvedValue(fakeMessage);

    const result = await service.sendMessage(input);

    expect(mockPrisma.message.create).toHaveBeenCalledWith({
      data: {
        content: input.content,
        textChannelId: input.channelId,
        userId: input.userId,
      },
      include: {
        user: true,
      },
    });

    expect(result).toEqual(fakeMessage);
  });
});
