import { Test, TestingModule } from '@nestjs/testing';
import { CommunityService } from './community.service';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCommunityDto } from './dto/create_community.dto';

describe('CommunityService', () => {
  let service: CommunityService;
  let prismaMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaMock = {
      community: {
        create: jest.fn().mockResolvedValue({
          id: 1,
          name: 'test server',
          ownerId: 1,
          memberships: [{ id: 1, userId: 1, role: 'OWNER' }],
        }),
      } as Partial<PrismaService['community']>,
    } as Partial<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
  });

  it('should create a community and register membership as OWNER', async () => {
    const dto: CreateCommunityDto = { name: 'test server' };
    const result = await service.createCommunity(1, dto);

    expect(result).toHaveProperty('id');
    expect(result.name).toBe(dto.name);
    expect(result.ownerId).toBe(1);
    expect((prismaMock.community as any).create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        ownerId: 1,
        memberships: {
          create: {
            userId: 1,
            role: 'OWNER',
          },
        },
      },
      include: {
        memberships: true,
      },
    });
  });
});
