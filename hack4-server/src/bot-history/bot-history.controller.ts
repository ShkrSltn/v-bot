import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { BotHistoryService } from './bot-history.service';
import { CreateBotHistoryDto, UpdateBotHistoryDto } from '../dto/bot-history.dto';
import { BotHistory } from '../models/bot-history.entity';
import { BotHistoryAnalyzerService } from './bot-history-analyzer.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('bot-history')
@Controller('bot-history')
export class BotHistoryController {
  constructor(
    private readonly botHistoryService: BotHistoryService,
    private readonly botHistoryAnalyzerService: BotHistoryAnalyzerService
  ) {}

  @Get()
  findAll(): Promise<BotHistory[]> {
    return this.botHistoryService.findAll();
  }

  @Get('analyze-similar-questions')
  @ApiOperation({ summary: 'Analyze similar questions in bot history' })
  @ApiQuery({ 
    name: 'threshold', 
    required: false, 
    type: Number, 
    description: 'Similarity threshold for grouping questions (0-1). If not specified, it is determined automatically.' 
  })
  @ApiQuery({ 
    name: 'minCount', 
    required: false, 
    type: Number, 
    description: 'Minimum number of similar questions for grouping. If not specified, it is determined automatically.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns groups of similar questions with recommendations for FAQ' 
  })
  async analyzeSimilarQuestions(
    @Query('threshold') threshold?: number,
    @Query('minCount') minCount?: number
  ) {
    return this.botHistoryAnalyzerService.analyzeSimilarQuestions(threshold, minCount);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<BotHistory> {
    return this.botHistoryService.findOne(id);
  }

  @Post()
  create(@Body() createBotHistoryDto: CreateBotHistoryDto): Promise<BotHistory> {
    return this.botHistoryService.create(createBotHistoryDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateBotHistoryDto: UpdateBotHistoryDto,
  ): Promise<BotHistory> {
    return this.botHistoryService.update(id, updateBotHistoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number): Promise<void> {
    return this.botHistoryService.remove(id);
  }

  @Post('process-embeddings')
  async processEmbeddings() {
    return this.botHistoryService.processHistoryEmbeddings();
  }

  @Post('analyze-unanswered')
  async analyzeUnansweredQuestions() {
    return this.botHistoryAnalyzerService.analyzeUnansweredQuestions();
  }

  @Post('add-to-faq')
  async addToFaq(@Body() recommendation: {
    question: string;
    answer: string;
    categoryName: string;
    subcategoryName: string;
  }) {
    // Здесь можно добавить логику для сохранения рекомендации в базу данных FAQ
    // Эта функция будет вызываться с фронтенда после подтверждения администратором
    return this.botHistoryService.addToFaq(recommendation);
  }
} 