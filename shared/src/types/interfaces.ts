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
