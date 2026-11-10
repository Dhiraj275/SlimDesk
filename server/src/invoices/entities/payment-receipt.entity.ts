import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('payment_receipts')
export class PaymentReceipt {
  @ApiProperty({
    example: '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
    description: 'Unique payment receipt UUID identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  receiptId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Freelancer user UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiProperty({
    example: 'e91fb183-209e-4c74-9f43-a618f0296ee8',
    description: 'Associated invoice payment UUID identifier',
  })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 36 })
  paymentId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Associated parent invoice UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  invoiceId: string;

  @ApiProperty({
    example: 'RCT-2026-001',
    description: 'Sequential payment receipt number',
  })
  @Index()
  @Column({ type: 'varchar', length: 50 })
  receiptNumber: string;

  @ApiProperty({
    example: '2026-11-08',
    description: 'Date receipt was issued (YYYY-MM-DD)',
  })
  @Column({ type: 'date' })
  receiptDate: string;

  @ApiProperty({
    example: 25000,
    description: 'Actual amount received in this payment transaction',
  })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value === null ? 0 : Number(value)),
    },
  })
  amountReceived: number;

  @ApiProperty({
    example: 'INR',
    description: 'Currency code (INR, USD, EUR, etc.)',
  })
  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @ApiProperty({
    example: 'upi',
    description: 'Method of payment (bank_transfer, upi, cash, card, other)',
  })
  @Column({ type: 'varchar', length: 50 })
  paymentMethod: string;

  @ApiPropertyOptional({
    example: 'UTR-984729182',
    description: 'Bank or transaction reference number',
  })
  @Column({ type: 'varchar', length: 150, nullable: true })
  referenceNumber: string | null;

  @ApiPropertyOptional({
    description: 'Client details snapshot at receipt generation time',
  })
  @Column({ type: 'json', nullable: true })
  clientInfo: Record<string, any> | null;

  @ApiPropertyOptional({
    description: 'Freelancer / studio details snapshot at receipt generation time',
  })
  @Column({ type: 'json', nullable: true })
  freelancerInfo: Record<string, any> | null;

  @ApiPropertyOptional({
    example: 'Payment received with thanks.',
    description: 'Notes or acknowledgement on the receipt',
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    example: '9a8b7c6d5e4f3a2b1c0d',
    description: 'Secure token for public unauthenticated receipt viewing',
  })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  publicToken: string;

  @ApiPropertyOptional({
    example: '2026-11-08T15:30:00Z',
    description: 'Timestamp when public receipt was first viewed by client',
  })
  @Column({ type: 'timestamp', nullable: true })
  viewedAt: Date | null;

  @ApiProperty({
    example: '2026-11-08T12:00:00Z',
    description: 'Receipt creation timestamp',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2026-11-08T12:00:00Z',
    description: 'Receipt last updated timestamp',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}

