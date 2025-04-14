import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { AdminRole } from '../models/admin-profile.entity';

export class CreateAdminProfileDto {
  @IsEnum(AdminRole)
  role: AdminRole;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone_number?: string;
}

export class UpdateAdminProfileDto {
  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;
} 