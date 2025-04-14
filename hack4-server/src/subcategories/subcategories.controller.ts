import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { CreateSubcategoryDto, UpdateSubcategoryDto } from '../dto/subcategory.dto';
import { Subcategory } from '../models/subcategory.entity';

@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Get()
  findAll(): Promise<Subcategory[]> {
    return this.subcategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Subcategory> {
    return this.subcategoriesService.findOne(id);
  }

  @Post()
  create(@Body() createSubcategoryDto: CreateSubcategoryDto): Promise<Subcategory> {
    return this.subcategoriesService.create(createSubcategoryDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
  ): Promise<Subcategory> {
    return this.subcategoriesService.update(id, updateSubcategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number): Promise<void> {
    return this.subcategoriesService.remove(id);
  }
} 