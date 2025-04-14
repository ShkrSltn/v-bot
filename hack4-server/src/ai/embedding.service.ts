import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqItem } from '../models/faq-item.entity';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingService {
  private readonly embeddings: OpenAIEmbeddings;
  private readonly logger = new Logger(EmbeddingService.name);
  private processing = false;
  private readonly defaultLimit = 100; 

  constructor(
    @InjectRepository(FaqItem)
    private faqItemRepository: Repository<FaqItem>,
    private configService: ConfigService,
  ) {
    this.embeddings = new OpenAIEmbeddings({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async processAllEmbeddings(limit?: number): Promise<{ processed: number, errors: number }> {
    if (this.processing) {
      return { processed: 0, errors: 0 };
    }
    
    let processed = 0;
    let errors = 0;
    
    try {
      this.processing = true;
      
      if (limit === undefined) {
        limit = await this.determineOptimalLimit();
      }
      
      const itemsWithoutEmbeddings = await this.faqItemRepository.find({
        where: { hasEmbedding: false },
        take: limit
      });
      
      this.logger.log(`Manual processing of ${itemsWithoutEmbeddings.length} items for embeddings (limit: ${limit})`);
      
      for (const item of itemsWithoutEmbeddings) {
        try {
          const textToEmbed = `${item.question} ${item.answer}`;
          const embedding = await this.embeddings.embedQuery(textToEmbed);
          
          item.embedding = embedding;
          item.hasEmbedding = true;
          await this.faqItemRepository.save(item);
          processed++;
        } catch (error) {
          this.logger.error(`Error embedding item ${item.id}: ${error.message}`);
          errors++;
        }
      }
      
      return { processed, errors };
    } catch (error) {
      this.logger.error(`General error in manual embedding process: ${error.message}`);
      return { processed, errors: errors + 1 };
    } finally {
      this.processing = false;
    }
  }


  private async determineOptimalLimit(): Promise<number> {
    try {
      const totalCount = await this.faqItemRepository.count({
        where: { hasEmbedding: false }
      });
      
      this.logger.log(`Found ${totalCount} items without embeddings`);
      
      if (totalCount === 0) {
        return this.defaultLimit;
      }
      
      if (totalCount <= 50) {
        return totalCount;
      }
      

      const optimalLimit = Math.min(
        500, 
        Math.max(
          30, 
          Math.ceil(totalCount * 0.25)
        )
      );
      
      this.logger.log(`Determined optimal limit of ${optimalLimit} based on ${totalCount} total items`);
      return optimalLimit;
    } catch (error) {
      this.logger.error(`Error determining optimal limit: ${error.message}`);
      return this.defaultLimit;
    }
  }


  @Cron('0 * * * *')
  async processNewEmbeddings() {
    if (this.processing) return;
    
    try {
      this.processing = true;
      

      const itemsWithoutEmbeddings = await this.faqItemRepository.find({
        where: { hasEmbedding: false },
        take: 50 
      });
      
      this.logger.log(`Processing ${itemsWithoutEmbeddings.length} items for embeddings`);
      
      for (const item of itemsWithoutEmbeddings) {
        try {
          const textToEmbed = `${item.question} ${item.answer}`;
          const embedding = await this.embeddings.embedQuery(textToEmbed);
          
          item.embedding = embedding;
          item.hasEmbedding = true;
          await this.faqItemRepository.save(item);
        } catch (error) {
          this.logger.error(`Error embedding item ${item.id}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`General error in embedding process: ${error.message}`);
    } finally {
      this.processing = false;
    }
  }
} 