import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [ChatModule, ConversationModule],
})
export class AppModule {}
