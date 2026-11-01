import {
  IsBoolean,
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
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LeadSource } from '../enums/lead-source.enum.js';

export class UpdateLeadDto {
  @ApiPropertyOptional({ example: 'Website Redesign & SEO', description: 'Updated opportunity title' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional({ example: 'Acme Studio Group', description: 'Updated contact name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ example: 'billing@acmestudio.com', description: 'Updated email' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '+1 (555) 765-4321', description: 'Updated phone' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: 'Acme Global Group', description: 'Updated company' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  company?: string;

  @ApiPropertyOptional({ enum: LeadSource, description: 'Updated acquisition source' })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ example: 'Next.js Frontend & API', description: 'Updated service' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  interestedService?: string;

  @ApiPropertyOptional({ example: 30000, description: 'Updated estimated budget' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedBudget?: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Updated currency' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ example: 'Updated project brief with expanded design scope.', description: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the lead is qualified' })
  @IsOptional()
  @IsBoolean()
  isQualified?: boolean;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Associated contactId' })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({ example: '2026-11-10T15:00:00.000Z', description: 'Updated follow-up date' })
  @IsOptional()
  @IsDateString()
  nextFollowUpDate?: string;

  @ApiPropertyOptional({ example: '2026-11-01T12:00:00.000Z', description: 'Last contacted date' })
  @IsOptional()
  @IsDateString()
  lastContactedDate?: string;
}
