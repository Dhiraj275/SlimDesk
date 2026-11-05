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
import type { Quotation } from './quotation.entity.js';

@Entity('quotation_items')
export class QuotationItem {
  @ApiProperty({
    example: 'd82fb183-109e-4c74-9f43-a618f0296ee9',
    description: 'Unique line item UUID identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  itemId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Quotation UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  quotationId: string;

  @ApiProperty({
    example: 'Frontend Development & Integration',
    description: 'Item description or service deliverable',
  })
  @Column({ type: 'varchar', length: 255 })
  description: string;

  @ApiProperty({
    example: 1,
    description: 'Quantity or hours',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1.0 })
  quantity: number;

  @ApiProperty({
    example: 'project',
    description: 'Unit of measurement (hrs, days, project, units)',
  })
  @Column({ type: 'varchar', length: 50, default: 'units' })
  unit: string;

  @ApiProperty({
    example: 25000.0,
    description: 'Unit price per quantity',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  unitPrice: number;

  @ApiPropertyOptional({
    example: 0.0,
    description: 'Line item discount amount',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  discount: number;

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
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  taxAmount: number;

  @ApiProperty({
    example: 25000.0,
    description: 'Calculated line total amount including tax and discount',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  totalAmount: number;

  @ApiProperty({
    example: 0,
    description: 'Sort ordering index in list',
  })
  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne('Quotation', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotation_id' })
  quotation?: Quotation;
}
