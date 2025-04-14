import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Category } from '../models/category.entity';
import { Subcategory } from '../models/subcategory.entity';
import { FaqItem } from '../models/faq-item.entity';
import { Document } from '../models/document.entity';

@Injectable()
export class DataMigrationService {
  private readonly logger = new Logger(DataMigrationService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private subcategoryRepository: Repository<Subcategory>,
    @InjectRepository(FaqItem)
    private faqItemRepository: Repository<FaqItem>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async migrateData() {
    try {
      // Загружаем данные из JSON файла
      const dataPath = path.resolve('data.json');
      const rawData = fs.readFileSync(dataPath, 'utf8');
      const data = JSON.parse(rawData);

      if (!data || !data.categories) {
        throw new Error('Invalid data format in data.json');
      }

      // Пройдемся по каждой категории
      for (const categoryName in data.categories) {
        // Создаем категорию
        const categoryEntity = this.categoryRepository.create({
          name: categoryName,
        });
        const savedCategory = await this.categoryRepository.save(categoryEntity);

        const subcategories = data.categories[categoryName];

        // Пройдемся по каждой подкатегории
        for (const subcategoryName in subcategories) {
          const subcategoryEntity = this.subcategoryRepository.create({
            name: subcategoryName,
            category_id: savedCategory.id,
          });
          const savedSubcategory = await this.subcategoryRepository.save(subcategoryEntity);

          const faqItems = subcategories[subcategoryName];

          // Пройдемся по каждому FAQ элементу
          for (const faqItem of faqItems) {
            const faqItemEntity = this.faqItemRepository.create({
              question: faqItem.Frage,
              answer: faqItem.Antwort,
              subcategory_id: savedSubcategory.id,
            });
            const savedFaqItem = await this.faqItemRepository.save(faqItemEntity);

            // Создаем документы/ссылки, если они есть
            if (faqItem['Dokumente und Links'] && faqItem['Dokumente und Links'].length > 0) {
              for (const docUrl of faqItem['Dokumente und Links']) {
                const documentEntity = this.documentRepository.create({
                  url: docUrl,
                  faq_item_id: savedFaqItem.id,
                });
                await this.documentRepository.save(documentEntity);
              }
            }
          }
        }
      }

      this.logger.log('Data migration completed successfully');
      return { success: true, message: 'Data migration completed successfully' };
    } catch (error) {
      this.logger.error(`Data migration failed: ${error.message}`);
      throw error;
    }
  }
}