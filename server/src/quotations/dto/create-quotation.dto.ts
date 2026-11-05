import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaxMode } from '../enums/tax-mode.enum.js';

export class QuotationItemDto {
  @ApiProperty({
    example: 'Frontend Development & Integration',
    description: 'Description of the service or deliverable',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 1,
    description: 'Quantity or hours',
  })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiPropertyOptional({
    example: 'project',
    description: 'Unit of measure (units, hrs, days, project)',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    example: 25000,
    description: 'Unit price per quantity',
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Line item discount amount',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Tax rate percentage (0 for none/unregistered, or 5/12/18/28 for GST)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Sort ordering index',
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class FreelancerInfoDto {
  @ApiProperty({ example: 'Dhiraj Freelancer' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Studio Freelance' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ example: 'hello@freelancer.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+91 98765 43210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Mumbai, Maharashtra' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  gstin?: string | null;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  state?: string;
}

export class ClientInfoDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Acme Studio' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: 'john@acme.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+1 555 123 4567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '123 Tech Park' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  gstin?: string | null;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  state?: string;
}

export class CreateQuotationDto {
  @ApiProperty({
    example: 'Website Redesign & Frontend Development',
    description: 'Quotation title / project subject',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'baf908e7-a1a6-43aa-abba-bc072ad8b59b',
    description: 'Associated contact UUID',
  })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({
    example: 'f13d3aba-edd3-464f-9e4e-2e9532b61966',
    description: 'Associated lead UUID',
  })
  @IsOptional()
  @IsUUID()
  leadId?: string;

  @ApiPropertyOptional({
    example: 'INR',
    description: 'ISO currency code (default: INR)',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    example: '2026-11-06',
    description: 'Quotation issue date (YYYY-MM-DD)',
  })
  @IsString()
  @IsNotEmpty()
  issueDate: string;

  @ApiProperty({
    example: '2026-11-20',
    description: 'Quotation valid-until date (YYYY-MM-DD)',
  })
  @IsString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiPropertyOptional({
    enum: TaxMode,
    default: TaxMode.NONE,
    description: 'Tax calculation mode (none, gst, flat)',
  })
  @IsOptional()
  @IsEnum(TaxMode)
  taxMode?: TaxMode;

  @ApiPropertyOptional({
    example: 0,
    description: 'Overall discount amount applied to subtotal',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({
    description: 'Freelancer profile snapshot at document creation',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => FreelancerInfoDto)
  freelancerInfo: FreelancerInfoDto;

  @ApiProperty({
    description: 'Client details snapshot at document creation',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ClientInfoDto)
  clientInfo: ClientInfoDto;

  @ApiPropertyOptional({
    example: '50% advance on approval, 50% upon final delivery',
    description: 'Payment milestone schedule',
  })
  @IsOptional()
  @IsString()
  paymentSchedule?: string;

  @ApiPropertyOptional({
    example: 'Quotation valid for 14 days. Work commences upon initial deposit.',
    description: 'Terms and conditions',
  })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({
    example: 'Thank you for considering our services.',
    description: 'Notes or message to client',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    type: [QuotationItemDto],
    description: 'Line items and service deliverables',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items: QuotationItemDto[];
}
