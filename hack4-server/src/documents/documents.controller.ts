import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from '../dto/document.dto';
import { Document } from '../models/document.entity';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll(): Promise<Document[]> {
    return this.documentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Document> {
    return this.documentsService.findOne(id);
  }

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto): Promise<Document> {
    return this.documentsService.create(createDocumentDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number): Promise<void> {
    return this.documentsService.remove(id);
  }
} 