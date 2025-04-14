import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { ScheduleModule } from '@nestjs/schedule';
import { Category } from '../models/category.entity';
import { Subcategory } from '../models/subcategory.entity';
import { FaqItem } from '../models/faq-item.entity';
import { Document } from '../models/document.entity';
import { BotHistory } from '../models/bot-history.entity';
import { BotHistoryService } from '../bot-history/bot-history.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Subcategory, FaqItem, Document, BotHistory]),
    ScheduleModule.forRoot(),
    ConfigModule,
  ],
  controllers: [AiController],
  providers: [AiService, BotHistoryService, EmbeddingService],
  exports: [AiService],
})
export class AiModule {}
