import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus } from '../enums/invoice-status.enum.js';
import { PaymentStatus } from '../enums/payment-status.enum.js';

export class InvoiceFilterQueryDto {
  @ApiPropertyOptional({
    description: 'Current page number',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of records per page',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: InvoiceStatus,
    description: 'Filter by invoice document status (draft, issued, cancelled)',
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  invoiceStatus?: InvoiceStatus;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    description: 'Filter by computed payment status (unpaid, partially_paid, paid, overdue, refunded)',
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Filter by associated contact ID',
  })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiPropertyOptional({
    description: 'Filter by originating quotation ID',
  })
  @IsOptional()
  @IsString()
  quotationId?: string;

  @ApiPropertyOptional({
    description: 'Search string across invoiceNumber, title, or client name/company',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

