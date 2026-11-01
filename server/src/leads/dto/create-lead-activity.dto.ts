import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../enums/activity-type.enum.js';

export class CreateLeadActivityDto {
  @ApiProperty({
    example: ActivityType.CALL,
    enum: ActivityType,
    description: 'Type of activity performed',
  })
  @IsNotEmpty()
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({
    example: 'Discussed project scope with CTO',
    description: 'Concise title or summary of the activity',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    example: 'Reviewed technical architecture and deliverables. Agreed to submit proposal by Friday.',
    description: 'Detailed description or meeting notes',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: { durationMinutes: 30, outcome: 'positive', attendees: ['Alice', 'Bob'] },
    description: 'Structured metadata (e.g. call duration, email subject, quotation details)',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    example: '2026-11-01T14:30:00.000Z',
    description: 'When the activity occurred (defaults to now)',
  })
  @IsOptional()
  @IsDateString()
  performedAt?: string;
}
