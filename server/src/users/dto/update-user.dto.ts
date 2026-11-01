import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../auth/enums/role.enum.js';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Alice Smith',
    description: 'Updated display name',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({
    example: 'alice.new@example.com',
    description: 'Updated email address',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    example: 'NewSecurePassword123',
    description: 'Updated password (minimum 8 characters)',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password?: string;

  @ApiPropertyOptional({
    example: 'admin',
    enum: Role,
    description: 'Updated user role (Admin only)',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

