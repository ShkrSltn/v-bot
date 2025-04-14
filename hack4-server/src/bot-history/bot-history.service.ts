import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotHistory } from '../models/bot-history.entity';
import { CreateBotHistoryDto, UpdateBotHistoryDto } from '../dto/bot-history.dto';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Category } from '../models/category.entity';
import { Subcategory } from '../models/subcategory.entity';
import { FaqItem } from '../models/faq-item.entity';

@Injectable()
export class BotHistoryService {
  private readonly embeddings: OpenAIEmbeddings;
  private readonly logger = new Logger(BotHistoryService.name);
  private processing = false;

  constructor(
    @InjectRepository(BotHistory)
    private botHistoryRepository: Repository<BotHistory>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private subcategoryRepository: Repository<Subcategory>,
    @InjectRepository(FaqItem)
    private faqItemRepository: Repository<FaqItem>,
  ) {
    this.embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async findAll(): Promise<BotHistory[]> {
    return this.botHistoryRepository.find({
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<BotHistory> {
    const botHistory = await this.botHistoryRepository.findOne({
      where: { id },
    });
    
    if (!botHistory) {
      throw new NotFoundException(`Bot history record with ID ${id} not found`);
    }
    
    return botHistory;
  }

  async create(createBotHistoryDto: CreateBotHistoryDto): Promise<BotHistory> {
    const newHistory = this.botHistoryRepository.create(createBotHistoryDto);
    
    // Сохраняем запись
    const savedHistory = await this.botHistoryRepository.save(newHistory);
    
    // Создаем эмбеддинг для вопроса, если вопрос не пустой
    if (savedHistory.question && savedHistory.question.trim()) {
      try {
        const embedding = await this.createEmbedding(savedHistory.question);
        savedHistory.embedding = embedding;
        savedHistory.hasEmbedding = true;
        await this.botHistoryRepository.save(savedHistory);
      } catch (error) {
        this.logger.error(`Error creating embedding for history item ${savedHistory.id}: ${error.message}`);
      }
    }
    
    return savedHistory;
  }

  async update(id: number, updateBotHistoryDto: UpdateBotHistoryDto): Promise<BotHistory> {
    const botHistory = await this.findOne(id);
    this.botHistoryRepository.merge(botHistory, updateBotHistoryDto);
    return this.botHistoryRepository.save(botHistory);
  }

  async remove(id: number): Promise<void> {
    const botHistory = await this.findOne(id);
    await this.botHistoryRepository.remove(botHistory);
  }

  async findAllUnanswered(): Promise<BotHistory[]> {
    return this.botHistoryRepository.find({
      where: { status: false },
      order: { date: 'DESC' },
    });
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      return await this.embeddings.embedQuery(text);
    } catch (error) {
      this.logger.error(`Error creating embedding: ${error.message}`);
      throw error;
    }
  }

  async processHistoryEmbeddings(limit: number = 100): Promise<{ processed: number, errors: number }> {
    if (this.processing) {
      return { processed: 0, errors: 0 };
    }
    
    let processed = 0;
    let errors = 0;
    
    try {
      this.processing = true;
      
      const itemsWithoutEmbeddings = await this.botHistoryRepository.find({
        where: { hasEmbedding: false },
        take: limit
      });
      
      this.logger.log(`Processing ${itemsWithoutEmbeddings.length} history items for embeddings`);
      
      for (const item of itemsWithoutEmbeddings) {
        try {
          const embedding = await this.createEmbedding(item.question);
          
          item.embedding = embedding;
          item.hasEmbedding = true;
          await this.botHistoryRepository.save(item);
          processed++;
        } catch (error) {
          this.logger.error(`Error embedding history item ${item.id}: ${error.message}`);
          errors++;
        }
      }
      
      return { processed, errors };
    } catch (error) {
      this.logger.error(`General error in history embedding process: ${error.message}`);
      return { processed, errors: errors + 1 };
    } finally {
      this.processing = false;
    }
  }

  async findSimilarQuestions(questionEmbedding: number[], threshold: number = 0.7, limit: number = 5): Promise<BotHistory[]> {
    const itemsWithEmbeddings = await this.botHistoryRepository.find({
      where: { hasEmbedding: true }
    });
    
    const similarItems = itemsWithEmbeddings
      .map(item => ({
        item,
        similarity: this.cosineSimilarity(questionEmbedding, item.embedding)
      }))
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(result => result.item);
    
    return similarItems;
  }
  
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
  }

  async addToFaq(recommendation: {
    question: string;
    answer: string;
    categoryName: string;
    subcategoryName: string;
  }): Promise<FaqItem> {
    try {
      // Поиск или создание категории
      let category = await this.categoryRepository.findOne({ 
        where: { name: recommendation.categoryName }
      });
      
      if (!category) {
        category = this.categoryRepository.create({ name: recommendation.categoryName });
        await this.categoryRepository.save(category);
      }
      
      // Поиск или создание подкатегории
      let subcategory = await this.subcategoryRepository.findOne({
        where: { 
          name: recommendation.subcategoryName,
          category: { id: category.id }
        }
      });
      
      if (!subcategory) {
        subcategory = this.subcategoryRepository.create({
          name: recommendation.subcategoryName,
          category: category
        });
        await this.subcategoryRepository.save(subcategory);
      }
      
      // Создание FAQ-элемента
      const faqItem = this.faqItemRepository.create({
        question: recommendation.question,
        answer: recommendation.answer,
        subcategory: subcategory
      });
      
      await this.faqItemRepository.save(faqItem);
      
      return faqItem;
    } catch (error) {
      this.logger.error(`Error adding recommendation to FAQ: ${error.message}`);
      throw error;
    }
  }
} 