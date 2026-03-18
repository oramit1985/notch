import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatMessage, ChatResponse, MessageRole } from '@notch/shared';
import { config } from '../config';

@Injectable()
export class ChatService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    const systemMessage = {
      role: 'system' as const,
      content:
        'You are a helpful and friendly assistant. You MUST end every single one of your messages with a unique emoji that you have not used before in this conversation. Choose the emoji based on the content or mood of your response.',
    };

    const fullMessages = [systemMessage, ...messages];

    const [chatCompletion, sentimentCompletion] = await Promise.all([
      /** Part A: chat response */
      this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: fullMessages,
      }),

      /** Part B: sentiment extraction via function calling */
      this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: fullMessages,
        tools: [
          {
            type: 'function',
            function: {
              name: 'record_sentiment',
              description:
                "Rate the user's current sentiment based on the conversation so far",
              parameters: {
                type: 'object',
                properties: {
                  score: {
                    type: 'number',
                    description:
                      'Sentiment score from 0 (very negative) to 100 (very positive)',
                  },
                },
                required: ['score'],
              },
            },
          },
        ],
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
