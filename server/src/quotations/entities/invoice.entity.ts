import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '../enums/invoice-status.enum.js';

@Entity('invoices')
export class Invoice {
  @ApiProperty({
    example: '9f8e7d6c-5b4a-3210-fedc-ba9876543210',
    description: 'Unique invoice UUID identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  invoiceId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Freelancer user UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Originating quotation UUID identifier (if converted)',
  })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 36, nullable: true })
  quotationId: string | null;

  @ApiPropertyOptional({
    example: 'baf908e7-a1a6-43aa-abba-bc072ad8b59b',
    description: 'Associated contact UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  contactId: string | null;

  @ApiProperty({
    example: 'INV-2026-001',
    description: 'Unique sequential invoice number',
  })
  @Index()
  @Column({ type: 'varchar', length: 50 })
  invoiceNumber: string;

  @ApiProperty({
    enum: InvoiceStatus,
    example: InvoiceStatus.DRAFT,
    description: 'Current invoice status',
  })
  @Index()
  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @ApiProperty({
    example: 'INR',
    description: 'ISO currency code',
  })
  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @ApiProperty({
    example: '2026-11-06',
    description: 'Invoice issue date (YYYY-MM-DD)',
  })
  @Column({ type: 'date' })
  issueDate: string;

  @ApiProperty({
    example: '2026-11-20',
    description: 'Invoice due date (YYYY-MM-DD)',
  })
  @Column({ type: 'date' })
  dueDate: string;

  @ApiProperty({
    example: 45000.0,
    description: 'Subtotal amount before tax',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  subtotal: number;

  @ApiProperty({
    example: 0.0,
    description: 'Total tax amount',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  taxAmount: number;

  @ApiProperty({
    example: 45000.0,
    description: 'Grand total payable amount',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  totalAmount: number;

  @ApiProperty({
    example: { name: 'Acme Studio', email: 'john@acme.com' },
    description: 'Client details snapshot',
  })
  @Column({ type: 'json' })
  clientInfo: Record<string, any>;

  @ApiProperty({
    example: { name: 'Dhiraj Freelancer', email: 'hello@freelancer.com' },
    description: 'Freelancer details snapshot',
  })
  @Column({ type: 'json' })
  freelancerInfo: Record<string, any>;

  @ApiPropertyOptional({
    example: 'Payment due within 14 days by bank transfer.',
    description: 'Payment instructions and terms',
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
