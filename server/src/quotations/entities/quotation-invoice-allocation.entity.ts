import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConversionBillingType } from '../enums/conversion-billing-type.enum.js';

@Entity('quotation_invoice_allocations')
export class QuotationInvoiceAllocation {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Unique allocation record UUID identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  allocationId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Quotation UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  quotationId: string;

  @ApiProperty({
    example: '9f8e7d6c-5b4a-3210-fedc-ba9876543210',
    description: 'Generated Invoice UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  invoiceId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Freelancer user UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiProperty({
    example: 25000,
    description: 'Amount allocated / billed on this invoice',
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value === null ? 0 : Number(value)),
    },
  })
  allocatedAmount: number;

  @ApiProperty({
    enum: ConversionBillingType,
    example: ConversionBillingType.PERCENTAGE,
    description: 'Type of conversion billing: full, percentage, or custom',
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: ConversionBillingType.FULL,
  })
  billingType: ConversionBillingType;

  @ApiPropertyOptional({
    example: 50,
    description: 'Percentage of total quotation amount if billingType is percentage',
  })
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null | undefined) => value,
      from: (value: string | null) => (value === null ? null : Number(value)),
    },
  })
  percentage: number | null;

  @ApiPropertyOptional({
    example: '50% advance payment before project kickoff',
    description: 'Notes or milestone description associated with this allocation',
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    example: '2026-11-10T12:00:00Z',
    description: 'Allocation timestamp',
  })
  @CreateDateColumn()
  createdAt: Date;
}

