import { Test, TestingModule } from '@nestjs/testing';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create_community.dto';

describe('CommunityController', () => {
  let controller: CommunityController;
  // let service: CommunityService;

  const mockCommunityService = {
    createCommunity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [
        {
          provide: CommunityService,
          useValue: mockCommunityService,
        },
      ],
    }).compile();

    controller = module.get<CommunityController>(CommunityController);
    // service = module.get<CommunityService>(CommunityService);
  });

  it('should create a community and return the result', async () => {
    const user = { userId: 1 };
    const dto: CreateCommunityDto = { name: 'test community' };
    const result = {
      id: 123,
      name: dto.name,
      ownerId: user.userId,
      memberships: [{ id: 1, userId: 1, role: 'OWNER' }],
    };

    mockCommunityService.createCommunity.mockResolvedValue(result);

    const res = await controller.createCommunity({ user }, dto);

    expect(res).toEqual(result);
    expect(mockCommunityService.createCommunity).toHaveBeenCalledWith(
      user.userId,
      dto,
    );
  });
});
