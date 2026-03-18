import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
  imports: [ChatModule],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
