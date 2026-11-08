import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Invoice } from './invoice.entity.js';

@Entity('invoice_items')
export class InvoiceItem {
  @ApiProperty({
    example: 'd82fb183-109e-4c74-9f43-a618f0296ee9',
    description: 'Unique line item UUID identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  itemId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Parent Invoice UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  invoiceId: string;

  @ApiProperty({
    example: 'Frontend Development & API Integration',
    description: 'Deliverable or service description',
  })
  @Column({ type: 'varchar', length: 500 })
  description: string;

  @ApiProperty({
    example: 1.0,
    description: 'Quantity or hours billed',
  })
  @Column({ type: 'decimal', precision: 12, scale: 3, default: 1.0 })
  quantity: number;

  @ApiProperty({
    example: 'units',
    description: 'Unit of measurement (units, hrs, days, project, etc.)',
  })
  @Column({ type: 'varchar', length: 30, default: 'units' })
  unit: string;

  @ApiProperty({
    example: 25000.0,
    description: 'Unit price per quantity',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  unitPrice: number;

  @ApiPropertyOptional({
    example: 0.0,
    description: 'Line item discount amount',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  discountAmount: number;

  @ApiProperty({
    example: 0.0,
    description: 'Tax rate percentage (0 for none/unregistered, or 5/12/18/28 for GST)',
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  taxRate: number;

  @ApiProperty({
    example: 0.0,
    description: 'Calculated tax amount for this item',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  taxAmount: number;

  @ApiProperty({
    example: 25000.0,
    description: 'Line total amount after discount and tax',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  totalAmount: number;

  @ApiProperty({
    example: 0,
    description: 'Sort ordering position in line items list',
  })
  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne('Invoice', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice?: Invoice;
}

