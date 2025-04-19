// src/chat/text-channel/text-channel.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { TextChannelService } from './text-channel.service';
import { CreateTextChannelDto } from './dto/create-text-channel.dto';

@Controller('text-channel')
export class TextChannelController {
  constructor(private readonly service: TextChannelService) {}

  @Post()
  async createChannel(@Request() req, @Body() dto: CreateTextChannelDto) {
    return this.service.createChannel(req.user.userId, dto);
  }

  @Get(':channelId/messages')
  async getMessages(
    @Request() req,
    @Param('channelId') channelId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.service.getMessages(
      req.user.userId,
      Number(channelId),
      Number(skip) || 0,
      Number(take) || 50,
    );
  }

  @Post(':channelId/read')
  async markAsRead(@Request() req, @Param('channelId') channelId: string) {
    return this.service.markAsRead(req.user.userId, Number(channelId));
  }
}
