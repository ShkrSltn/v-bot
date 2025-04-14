import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './models/category.entity';
import { Subcategory } from './models/subcategory.entity';
import { FaqItem } from './models/faq-item.entity';
import { Document } from './models/document.entity';
import { DataMigrationModule } from './data-migration/data-migration.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { FaqItemsModule } from './faq-items/faq-items.module';
import { DocumentsModule } from './documents/documents.module';
import { BotHistory } from './models/bot-history.entity';
import { BotHistoryModule } from './bot-history/bot-history.module';
import { AdminProfile } from './models/admin-profile.entity';
import { AdminProfilesModule } from './admin-profiles/admin-profiles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [Category, Subcategory, FaqItem, Document, BotHistory, AdminProfile],
      synchronize: false, // Не использовать в продакшене!
    }),
    AiModule,
    DataMigrationModule,
    CategoriesModule,
    SubcategoriesModule,
    FaqItemsModule,
    DocumentsModule,
    BotHistoryModule,
    AdminProfilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
