import {MessageRole} from './enums';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  role: MessageRole.Assistant;
  content: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: number;
}

export interface Conversation extends ConversationSummary {
  messages: ChatMessage[];
}

export interface CreateMessageRequest {
  content: string;
}
