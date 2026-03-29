import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async chat(message: string) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      this.logger.error('GROQ_API_KEY is not set in environment variables');
      return { 
        reply: 'AI assistant is not configured. Please contact support.' 
      };
    }

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant for OceanVoyage, a premium cruise booking platform. 
You help guests with questions about cruises, cabin types, onboard restaurants, 
entertainment shows, and casino events. 
Keep your answers friendly, concise, and relevant to cruise travel.
If asked about something unrelated to cruises or travel, politely redirect the conversation.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const reply =
        completion.choices?.[0]?.message?.content?.trim() ||
        'I could not generate a response. Please try again.';

      this.logger.log(`AI Response generated successfully using Groq (llama-3.3-70b)`);
      return { reply };

    } catch (error: any) {
      const status = error?.status;
      const errorMessage = error?.message || 'Unknown error';

      this.logger.error(`AI Error [${status}]: ${errorMessage}`);

      if (status === 401) {
        return { reply: 'AI service authentication failed. Please check the API key.' };
      }

      if (status === 429) {
        return { reply: 'AI service is busy right now. Please try again in a moment.' };
      }

      if (status === 404) {
        return { reply: 'The AI model or service could not be found. Please contact support.' };
      }

      return { 
        reply: 'AI assistant is temporarily unavailable. Please try again.' 
      };
    }
  }
}