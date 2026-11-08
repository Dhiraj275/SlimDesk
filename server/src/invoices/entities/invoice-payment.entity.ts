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
import { PaymentMethod } from '../enums/payment-method.enum.js';
import { PaymentRecordStatus } from '../enums/payment-record-status.enum.js';
import type { Invoice } from './invoice.entity.js';

@Entity('invoice_payments')
export class InvoicePayment {
  @ApiProperty({
    example: 'e91fb183-209e-4c74-9f43-a618f0296ee8',
    description: 'Unique payment transaction UUID identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  paymentId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Parent Invoice UUID identifier',
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
    example: 25000.0,
    description: 'Payment amount received',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.UPI,
    description: 'Payment method used',
  })
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    example: '2026-11-08',
    description: 'Date payment was received (YYYY-MM-DD)',
  })
  @Column({ type: 'date' })
  paymentDate: string;

  @ApiPropertyOptional({
    example: 'UTR9384729184',
    description: 'Bank reference number, UTR, or transaction receipt code',
  })
  @Column({ type: 'varchar', length: 150, nullable: true })
  referenceNumber: string | null;

  @ApiPropertyOptional({
    example: 'Received first milestone installment via Google Pay UPI',
    description: 'Internal payment notes or comments',
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    enum: PaymentRecordStatus,
    example: PaymentRecordStatus.COMPLETED,
    description: 'Status of the payment record',
  })
  @Column({
    type: 'enum',
    enum: PaymentRecordStatus,
    default: PaymentRecordStatus.COMPLETED,
  })
  status: PaymentRecordStatus;

  @ApiPropertyOptional({
    example: 'Customer requested refund due to duplicate transfer',
    description: 'Reason if payment was refunded',
  })
  @Column({ type: 'text', nullable: true })
  refundReason: string | null;

  @ApiPropertyOptional({
    example: '2026-11-09T10:00:00Z',
    description: 'Timestamp when payment was marked refunded',
  })
  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne('Invoice', 'payments', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice?: Invoice;
}

