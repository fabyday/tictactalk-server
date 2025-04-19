import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { ChatController } from './chat/chat.controller';
import { CommunityController } from './chat/community/community.controller';
import { CommunityModule } from './chat/community/community.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ChatModule,
    AuthModule,
    CommunityModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController, ChatController, CommunityController],
  providers: [AppService],
})
export class AppModule {}
