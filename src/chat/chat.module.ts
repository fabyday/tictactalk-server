import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { CommunityController } from './community/community.controller';
import { CommunityService } from './community/community.service';
import { PrismaModule } from 'prisma/prisma.module';
import { CommunityModule } from './community/community.module';
import { TextChannelController } from './text-channel/text-channel.controller';
import { TextChannelService } from './text-channel/text-channel.service';
@Module({
  providers: [ChatGateway, ChatService, CommunityService, TextChannelService],
  controllers: [ChatController, CommunityController, TextChannelController],
  imports: [PrismaModule, CommunityModule],
})
export class ChatModule {}
