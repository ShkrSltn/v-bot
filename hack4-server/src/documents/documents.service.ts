import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../models/document.entity';
import { CreateDocumentDto, UpdateDocumentDto } from '../dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async findAll(): Promise<Document[]> {
    return this.documentRepository.find({ 
      relations: ['faqItem'] 
    });
  }

  async findOne(id: number): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['faqItem']
    });
    
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    
    return document;
  }

  async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
    const document = this.documentRepository.create(createDocumentDto);
    return this.documentRepository.save(document);
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
    const document = await this.findOne(id);
    this.documentRepository.merge(document, updateDocumentDto);
    return this.documentRepository.save(document);
  }

  async remove(id: number): Promise<void> {
    const document = await this.findOne(id);
    await this.documentRepository.remove(document);
  }
} 