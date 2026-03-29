import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(
    @Body() body: { message: string }
  ): Promise<{ reply: string }> {
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return { reply: 'Invalid message' };
    }

    return this.aiService.chat(message);
  }
}