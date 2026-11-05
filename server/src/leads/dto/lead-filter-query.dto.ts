import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus } from '../enums/lead-status.enum.js';
import { LeadSource } from '../enums/lead-source.enum.js';

export class LeadFilterQueryDto {
  @ApiPropertyOptional({
    example: 'Acme',
    description: 'Search string matching title, name, email, company, or interested service',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'undefined' || value === 'null' || value === '' ? undefined : value
  )
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: LeadStatus,
    description: 'Filter leads by specific pipeline status',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'all' || value === 'undefined' || value === 'null' || value === '' ? undefined : value
  )
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({
    enum: LeadSource,
    description: 'Filter leads by acquisition source',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'all' || value === 'undefined' || value === 'null' || value === '' ? undefined : value
  )
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter leads by qualification status',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean()
  isQualified?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Only return leads with pending follow-ups that are past their due date',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean()
  overdueOnly?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Alias for overdueOnly: filter leads with overdue follow-ups',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean()
  overdueFollowUp?: boolean;

  @ApiPropertyOptional({
    example: 50,
    description: 'Maximum number of items to return',
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({
    example: 0,
    description: 'Number of items to skip for pagination',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
