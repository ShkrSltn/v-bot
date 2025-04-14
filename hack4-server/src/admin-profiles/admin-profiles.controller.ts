import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Put, 
  NotFoundException,
  HttpStatus,
  HttpCode 
} from '@nestjs/common';
import { AdminProfilesService } from './admin-profiles.service';
import { CreateAdminProfileDto, UpdateAdminProfileDto } from '../dto/admin-profile.dto';
import { AdminProfile } from '../models/admin-profile.entity';

@Controller('admin-profiles')
export class AdminProfilesController {
  constructor(private readonly adminProfilesService: AdminProfilesService) {}

  @Get()
  findAll(): Promise<AdminProfile[]> {
    return this.adminProfilesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AdminProfile> {
    return this.adminProfilesService.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateAdminProfileDto): Promise<AdminProfile> {
    return this.adminProfilesService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdminProfileDto,
  ): Promise<AdminProfile> {
    return this.adminProfilesService.update(+id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.adminProfilesService.remove(+id);
  }
} 