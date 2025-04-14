import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProfile } from '../models/admin-profile.entity';
import { AdminProfilesService } from './admin-profiles.service';
import { AdminProfilesController } from './admin-profiles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdminProfile])],
  controllers: [AdminProfilesController],
  providers: [AdminProfilesService],
  exports: [AdminProfilesService],
})
export class AdminProfilesModule {} 