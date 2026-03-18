import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import {ChatMessage, ChatResponse, MessageRole, OpenAiModels} from '@notch/shared';
import { config } from '../config';
import {CHAT_SYSTEM_MESSAGE, SENTIMENT_TOOL} from "./chat.consts";

@Injectable()
export class ChatService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    const systemMessage = {
      role: MessageRole.System,
      content: CHAT_SYSTEM_MESSAGE,
    };

    const fullMessages = [systemMessage, ...messages];

    const [chatCompletion, sentimentCompletion] = await Promise.all([
      /** Part A: chat response */
      this.openai.chat.completions.create({
        model: OpenAiModels.FOUR_O_MINI,
        messages: fullMessages,
      }),

      /** Part B: sentiment extraction via function calling */
      this.openai.chat.completions.create({
        model: OpenAiModels.FOUR_O_MINI,
        messages: fullMessages,
        tools: [ SENTIMENT_TOOL ],
        tool_choice: {
          type: 'function',
          function: { name: 'record_sentiment' },
        },
      }),
    ]);

    /** Log sentiment (Part B) */
    const toolCall = sentimentCompletion.choices[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const { score } = JSON.parse(toolCall.function.arguments) as {
        score: number;
      };
      console.log(`[Sentiment] User sentiment score: ${score}/100`);
    }

    return {
      role: MessageRole.Assistant,
      content: chatCompletion.choices[0]?.message?.content ?? '',
    };
  }
}
