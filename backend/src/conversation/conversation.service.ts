import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Conversation,
  ConversationSummary,
  ChatResponse,
  MessageRole, truncateWithEllipsis,
} from '@notch/shared';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class ConversationService {
  private readonly conversations = new Map<string, Conversation>();

  constructor(private readonly chatService: ChatService) {}

  findAll(): ConversationSummary[] {
    return [...this.conversations.values()]
      .map(({ id, title, createdAt }) => ({ id, title, createdAt }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  findOne(id: string): Conversation {
    const conversation = this.conversations.get(id);
    if (!conversation) throw new NotFoundException(`Conversation not found`);
    return conversation;
  }

  create(): Conversation {
    const id = crypto.randomUUID();
    const conversation: Conversation = {
      id,
      title: 'New conversation',
      messages: [],
      createdAt: Date.now(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async sendMessage(id: string, content: string): Promise<ChatResponse> {
    const conversation = this.findOne(id);

    conversation.messages.push({ role: MessageRole.User, content });

    if (conversation.messages.length === 1) {
      conversation.title = truncateWithEllipsis(content, 45);
    }

    const response = await this.chatService.chat(conversation.messages);
    conversation.messages.push({
      role: MessageRole.Assistant,
      content: response.content,
    });

    return response;
  }
}
