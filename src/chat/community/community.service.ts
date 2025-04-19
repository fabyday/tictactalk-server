import { Injectable } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create_community.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Community, Membership } from '@prisma/client';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async findUserCommunities(userId: number): Promise<Membership[]> {
    return this.prisma.membership.findMany({
      where: { userId },
      include: {
        community: true,
      },
    });
  }

  async createCommunity(
    userId: number,
    dto: CreateCommunityDto,
  ): Promise<Community> {
    return this.prisma.community.create({
      data: {
        name: dto.name,
        ownerId: userId,
        memberships: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        memberships: true,
      },
    });
  }
}
