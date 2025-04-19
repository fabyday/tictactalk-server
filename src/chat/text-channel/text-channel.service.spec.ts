import { Test, TestingModule } from '@nestjs/testing';
import { TextChannelService } from './text-channel.service';
import { PrismaService } from 'prisma/prisma.service'; // 실제 경로에 맞게 수정

describe('TextChannelService', () => {
  let service: TextChannelService;

  const mockPrisma = {
    textChannel: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
