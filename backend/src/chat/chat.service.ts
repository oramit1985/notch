import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { config } from '../config';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class ChatService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  }

  async chat(messages: ChatMessage[]) {
    const systemMessage = {
      role: 'system' as const,
      content:
        'You are a helpful and friendly assistant. You MUST end every single one of your messages with a unique emoji that you have not used before in this conversation. Choose the emoji based on the content or mood of your response.',
    };

    const fullMessages = [systemMessage, ...messages];

    // Part A + Part B run in parallel
    const [chatCompletion, sentimentCompletion] = await Promise.all([
      // Part A: chat response
      this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: fullMessages,
      }),

      // Part B: sentiment extraction via function calling
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

    // Log sentiment (Part B)
    const toolCall =
      sentimentCompletion.choices[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const { score } = JSON.parse(toolCall.function.arguments) as {
        score: number;
      };
      console.log(`[Sentiment] User sentiment score: ${score}/100`);
    }

    return {
      role: 'assistant',
      content: chatCompletion.choices[0]?.message?.content ?? '',
    };
  }
}
