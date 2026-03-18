import { Body, Controller, Post } from '@nestjs/common';
import { ChatRequest } from '@notch/shared';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: ChatRequest) {
    return this.chatService.chat(body.messages);
  }
}
