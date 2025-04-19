import { Test, TestingModule } from '@nestjs/testing';
import { TextChannelService } from '../../text-channel.service';
import { PrismaService } from 'prisma/prisma.service';

describe('TextChannelService.createChannel()', () => {
  let service: TextChannelService;

  const mockPrisma = {
    textChannel: {
      create: jest.fn(),
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

  it('should create a text channel with correct data', async () => {
    const userId = 1;
    const dto = {
      name: 'general',
      communityId: 10,
      categoryId: 5,
    };

    const expectedResult = { id: 123, ...dto };
    mockPrisma.textChannel.create.mockResolvedValue(expectedResult);

    const result = await service.createChannel(userId, dto);

    expect(mockPrisma.textChannel.create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        communityId: dto.communityId,
        categoryId: dto.categoryId,
      },
    });

    expect(result).toEqual(expectedResult);
  });
});
