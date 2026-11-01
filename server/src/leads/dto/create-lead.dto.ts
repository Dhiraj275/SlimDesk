import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadSource } from '../enums/lead-source.enum.js';

export class CreateLeadDto {
  @ApiPropertyOptional({
    example: 'Website Redesign',
    description: 'Project or opportunity title',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @ApiProperty({
    example: 'Acme Studio',
    description: 'Lead contact or business name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'hello@acmestudio.com',
    description: 'Primary contact email',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    example: '+1 (555) 345-6789',
    description: 'Contact phone number',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    example: 'Acme Studio Inc.',
    description: 'Company or organization',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  company?: string;

  @ApiPropertyOptional({
    example: LeadSource.WEBSITE,
    enum: LeadSource,
    default: LeadSource.OTHER,
    description: 'Where the lead originated',
  })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({
    example: 'Full-stack Web Application',
    description: 'Service or scope the lead is interested in',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  interestedService?: string;

  @ApiPropertyOptional({
    example: 25000,
    description: 'Estimated project budget',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedBudget?: number;

  @ApiPropertyOptional({
    example: 'USD',
    default: 'USD',
    description: 'Currency code for budget',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({
    example: 'Looking for a responsive e-commerce web platform by Q1.',
    description: 'Requirements or inquiry details',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Existing contactId to link with this opportunity',
  })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({
    example: '2026-11-05T10:00:00.000Z',
    description: 'Optional initial follow-up due date',
  })
  @IsOptional()
  @IsDateString()
  nextFollowUpDate?: string;

  @ApiPropertyOptional({
    example: 'Call to review project brief after partner review.',
    description: 'Initial follow-up reminder note',
  })
  @IsOptional()
  @IsString()
  followUpNotes?: string;
}
