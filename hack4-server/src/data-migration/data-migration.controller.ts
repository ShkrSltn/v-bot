import { Controller, Post, HttpCode } from '@nestjs/common';
import { DataMigrationService } from './data-migration.service';

@Controller('data-migration')
export class DataMigrationController {
  constructor(private readonly dataMigrationService: DataMigrationService) {}

  @Post('migrate')
  @HttpCode(200)
  async migrateData() {
    return this.dataMigrationService.migrateData();
  }
}