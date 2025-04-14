import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminProfile } from '../models/admin-profile.entity';
import { CreateAdminProfileDto } from '../dto/admin-profile.dto';
import { UpdateAdminProfileDto } from '../dto/admin-profile.dto';

@Injectable()
export class AdminProfilesService {
  private readonly logger = new Logger(AdminProfilesService.name);

  constructor(
    @InjectRepository(AdminProfile)
    private adminProfileRepository: Repository<AdminProfile>,
  ) {}

  async findAll(): Promise<AdminProfile[]> {
    return this.adminProfileRepository.find();
  }

  async findOne(id: number): Promise<AdminProfile> {
    const profile = await this.adminProfileRepository.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Admin profile with ID ${id} not found`);
    }
    return profile;
  }

  async findByEmail(email: string): Promise<AdminProfile> {
    const profile = await this.adminProfileRepository.findOne({ where: { email } });
    if (!profile) {
      throw new NotFoundException(`Admin profile with email ${email} not found`);
    }
    return profile;
  }

  async create(createDto: CreateAdminProfileDto): Promise<AdminProfile> {
    const profile = this.adminProfileRepository.create(createDto);
    return this.adminProfileRepository.save(profile);
  }

  async update(id: number, updateDto: UpdateAdminProfileDto): Promise<AdminProfile> {
    const profile = await this.findOne(id);
    
    // Обновляем только предоставленные поля
    Object.assign(profile, updateDto);
    
    return this.adminProfileRepository.save(profile);
  }

  async remove(id: number): Promise<void> {
    const result = await this.adminProfileRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Admin profile with ID ${id} not found`);
    }
  }
} 