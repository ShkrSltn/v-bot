import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotHistory } from '../models/bot-history.entity';
import { BotHistoryService } from './bot-history.service';
import { BotHistoryController } from './bot-history.controller';
import { BotHistoryAnalyzerService } from './bot-history-analyzer.service';
import { ScheduleModule } from '@nestjs/schedule';
import { Category } from '../models/category.entity';
import { Subcategory } from '../models/subcategory.entity';
import { FaqItem } from '../models/faq-item.entity';
import { AiModule } from '../ai/ai.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([BotHistory, Category, Subcategory, FaqItem]),
    ScheduleModule.forRoot(),
    AiModule,
    ConfigModule,
  ],
  controllers: [BotHistoryController],
  providers: [
    BotHistoryService,
    BotHistoryAnalyzerService,
  ],
  exports: [
    BotHistoryService,
    BotHistoryAnalyzerService,
  ]
})
export class BotHistoryModule {} 