import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: ChatRequest) {
    return this.chatService.chat(body.messages);
  }
}
