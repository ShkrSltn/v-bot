import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { FaqItemsService } from './faq-items.service';
import { CreateFaqItemDto, UpdateFaqItemDto } from '../dto/faq-item.dto';
import { FaqItem } from '../models/faq-item.entity';

@Controller('faq-items')
export class FaqItemsController {
  constructor(private readonly faqItemsService: FaqItemsService) {}

  @Get()
  findAll(): Promise<FaqItem[]> {
    return this.faqItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<FaqItem> {
    return this.faqItemsService.findOne(id);
  }

  @Post()
  create(@Body() createFaqItemDto: CreateFaqItemDto): Promise<FaqItem> {
    return this.faqItemsService.create(createFaqItemDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateFaqItemDto: UpdateFaqItemDto,
  ): Promise<FaqItem> {
    return this.faqItemsService.update(id, updateFaqItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number): Promise<void> {
    return this.faqItemsService.remove(id);
  }
} 