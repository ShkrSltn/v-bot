import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcategory } from '../models/subcategory.entity';
import { CreateSubcategoryDto, UpdateSubcategoryDto } from '../dto/subcategory.dto';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory)
    private subcategoryRepository: Repository<Subcategory>,
  ) {}

  async findAll(): Promise<Subcategory[]> {
    return this.subcategoryRepository.find({ 
      relations: ['category', 'faqItems'] 
    });
  }

  async findOne(id: number): Promise<Subcategory> {
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id },
      relations: ['category', 'faqItems']
    });
    
    if (!subcategory) {
      throw new NotFoundException(`Subcategory with ID ${id} not found`);
    }
    
    return subcategory;
  }

  async create(createSubcategoryDto: CreateSubcategoryDto): Promise<Subcategory> {
    const subcategory = this.subcategoryRepository.create(createSubcategoryDto);
    return this.subcategoryRepository.save(subcategory);
  }

  async update(id: number, updateSubcategoryDto: UpdateSubcategoryDto): Promise<Subcategory> {
    const subcategory = await this.findOne(id);
    this.subcategoryRepository.merge(subcategory, updateSubcategoryDto);
    return this.subcategoryRepository.save(subcategory);
  }

  async remove(id: number): Promise<void> {
    const subcategory = await this.findOne(id);
    await this.subcategoryRepository.remove(subcategory);
  }
} 