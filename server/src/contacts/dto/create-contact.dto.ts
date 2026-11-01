import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    example: 'Acme Studio',
    description: 'Name of the contact or business',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'contact@acmestudio.com',
    description: 'Primary email address',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    example: '+1 (555) 234-5678',
    description: 'Contact phone number',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    example: 'Acme Inc.',
    description: 'Company or organization',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  company?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether contact is already a paying client',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isClient?: boolean;
}
