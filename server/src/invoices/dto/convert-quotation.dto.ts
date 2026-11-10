import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ConversionBillingType } from '../../quotations/enums/conversion-billing-type.enum.js';

export class ConvertQuotationDto {
  @ApiPropertyOptional({
    enum: ConversionBillingType,
    default: ConversionBillingType.FULL,
    description: 'Billing structure: full (entire quotation or remaining balance), percentage (advance deposit), or custom amount',
    example: ConversionBillingType.PERCENTAGE,
  })
  @IsOptional()
  @IsEnum(ConversionBillingType)
  billingType?: ConversionBillingType = ConversionBillingType.FULL;

  @ApiPropertyOptional({
    description: 'Percentage if billingType is percentage (0.01 - 100)',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  percentage?: number;

  @ApiPropertyOptional({
    description: 'Custom milestone amount if billingType is custom',
    example: 25000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  customAmount?: number;

  @ApiPropertyOptional({
    description: 'Optional reusable payment profile UUID to snapshot payment instructions',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  paymentProfileId?: string;

  @ApiPropertyOptional({
    description: 'Notes or milestone description (e.g. "50% advance before kickoff")',
    example: '50% advance payment before project kickoff',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Invoice due date in YYYY-MM-DD format (defaults to 14 days from today)',
    example: '2026-11-25',
  })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Invoice issue date in YYYY-MM-DD format (defaults to today)',
    example: '2026-11-11',
  })
  @IsOptional()
  @IsString()
  issueDate?: string;
}

