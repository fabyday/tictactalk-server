import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt_auth.guard';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create_community.dto';

@UseGuards(JwtAuthGuard)
@Controller('chat/community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  async createCommunity(@Request() req, @Body() dto: CreateCommunityDto) {
    return this.communityService.createCommunity(req.user.userId, dto);
  }

  @Get()
  async getUserCommunities(@Request() req) {
    return this.communityService.findUserCommunities(req.user.userId);
  }
}
