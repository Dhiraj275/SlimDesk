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
import { TaxMode } from '../../quotations/enums/tax-mode.enum.js';
import {
  FreelancerInfoDto,
  ClientInfoDto,
} from '../../quotations/dto/create-quotation.dto.js';

export class InvoiceItemDto {
  @ApiProperty({
    example: 'Frontend Development & Integration',
    description: 'Description of the service or deliverable billed',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 1,
    description: 'Quantity or hours billed',
  })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiPropertyOptional({
    example: 'project',
    description: 'Unit of measure (units, hrs, days, project, etc.)',
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
  discountAmount?: number;

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
    description: 'Sort ordering index in line items list',
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateInvoiceDto {
  @ApiProperty({
    example: 'Website Redesign & Frontend Development',
    description: 'Invoice title / project subject',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'baf908e7-a1a6-43aa-abba-bc072ad8b59b',
    description: 'Associated client contact UUID',
  })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({
    example: 'f13d3aba-edd3-464f-9e4e-2e9532b61966',
    description: 'Originating quotation UUID (if converted)',
  })
  @IsOptional()
  @IsUUID()
  quotationId?: string;

  @ApiPropertyOptional({
    example: 'INR',
    description: 'ISO currency code (default: INR)',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    example: '2026-11-08',
    description: 'Invoice issuance date (YYYY-MM-DD)',
  })
  @IsString()
  @IsNotEmpty()
  issueDate: string;

  @ApiProperty({
    example: '2026-11-15',
    description: 'Payment due deadline date (YYYY-MM-DD)',
  })
  @IsString()
  @IsNotEmpty()
  dueDate: string;

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
    description: 'Freelancer profile snapshot at invoice creation',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => FreelancerInfoDto)
  freelancerInfo: FreelancerInfoDto;

  @ApiProperty({
    description: 'Client details snapshot at invoice creation',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ClientInfoDto)
  clientInfo: ClientInfoDto;

  @ApiPropertyOptional({
    example: 'Bank: HDFC Bank | A/C: 50100012345678 | IFSC: HDFC0001234 | UPI: freelancer@upi',
    description: 'Bank transfer or UPI payment instructions',
  })
  @IsOptional()
  @IsString()
  paymentDetails?: string;

  @ApiPropertyOptional({
    example: 'Payment due within 7 days of invoice issuance. Late fee of 1.5% per month applies.',
    description: 'Payment terms and conditions',
  })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({
    example: 'Thank you for your business! Please include INV-2026-001 in your transfer remarks.',
    description: 'Notes or message to client',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    type: [InvoiceItemDto],
    description: 'Line items and billed services',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}

