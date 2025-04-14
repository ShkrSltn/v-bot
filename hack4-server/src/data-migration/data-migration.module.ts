import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataMigrationService } from './data-migration.service';
import { DataMigrationController } from './data-migration.controller';
import { Category } from '../models/category.entity';
import { Subcategory } from '../models/subcategory.entity';
import { FaqItem } from '../models/faq-item.entity';
import { Document } from '../models/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Subcategory, FaqItem, Document])],
  providers: [DataMigrationService],
  controllers: [DataMigrationController],
  exports: [DataMigrationService],
})
export class DataMigrationModule {}