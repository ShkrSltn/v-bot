import { Controller, Post, Body, HttpCode, Get, Param, Res } from '@nestjs/common';
import { AiService, ChatOptions } from './ai.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { EmbeddingService } from './embedding.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly embeddingService: EmbeddingService
  ) {}

  @Post('chat')
  @HttpCode(200)
  async chat(@Body() body: { question: string, options?: ChatOptions }): Promise<string> {
    return this.aiService.generateChatResponse(body.question, body.options);
  }

  @Post('process-embeddings')
  @HttpCode(200)
  async processEmbeddings(@Body() body?: { limit?: number }): Promise<{ processed: number, errors: number }> {
    const limit = body?.limit;
    return this.embeddingService.processAllEmbeddings(limit);
  }


}