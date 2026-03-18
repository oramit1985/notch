import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateMessageRequest } from '@notch/shared';
import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  findAll() {
    return this.conversationService.findAll();
  }

  @Post()
  create() {
    return this.conversationService.create();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationService.findOne(id);
  }

  @Post(':id/chat')
  sendMessage(@Param('id') id: string, @Body() body: CreateMessageRequest) {
    return this.conversationService.sendMessage(id, body.content);
  }
}
