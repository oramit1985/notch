import {ChatCompletionTool} from "openai/src/resources/chat/completions/completions";

/** this should be stored in db in order to make it configurable without releasing a new version */
export const CHAT_SYSTEM_MESSAGE = 'You are a helpful and friendly assistant. You MUST end every single one of your messages with a unique emoji that you have not used before in this conversation. Choose the emoji based on the content or mood of your response.';

export const SENTIMENT_TOOL = <ChatCompletionTool>{
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
};