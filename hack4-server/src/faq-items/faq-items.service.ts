import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqItem } from '../models/faq-item.entity';
import { CreateFaqItemDto, UpdateFaqItemDto } from '../dto/faq-item.dto';

@Injectable()
export class FaqItemsService {
  constructor(
    @InjectRepository(FaqItem)
    private faqItemRepository: Repository<FaqItem>,
  ) {}

  async findAll(): Promise<FaqItem[]> {
    return this.faqItemRepository.find({ 
      relations: ['subcategory', 'documents'] 
    });
  }

  async findOne(id: number): Promise<FaqItem> {
    const faqItem = await this.faqItemRepository.findOne({ 
      where: { id },
      relations: ['subcategory', 'documents']
    });
    
    if (!faqItem) {
      throw new NotFoundException(`FAQ item with ID ${id} not found`);
    }
    
    return faqItem;
  }

  async create(createFaqItemDto: CreateFaqItemDto): Promise<FaqItem> {
    const faqItem = this.faqItemRepository.create(createFaqItemDto);
    return this.faqItemRepository.save(faqItem);
  }

  async update(id: number, updateFaqItemDto: UpdateFaqItemDto): Promise<FaqItem> {
    const faqItem = await this.findOne(id);
    this.faqItemRepository.merge(faqItem, updateFaqItemDto);
    return this.faqItemRepository.save(faqItem);
  }

  async remove(id: number): Promise<void> {
    const faqItem = await this.findOne(id);
    await this.faqItemRepository.remove(faqItem);
  }
} 