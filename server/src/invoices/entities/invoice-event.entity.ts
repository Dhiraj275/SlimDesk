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

@Entity('invoice_events')
export class InvoiceEvent {
  @ApiProperty({
    example: 'f72fb183-309e-4c74-9f43-a618f0296ee7',
    description: 'Unique timeline event UUID identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  eventId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Parent Invoice UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  invoiceId: string;

  @ApiProperty({
    example: 'payment_recorded',
    description: 'Type of invoice event',
  })
  @Column({ type: 'varchar', length: 100 })
  eventType: string;

  @ApiPropertyOptional({
    example: 'Payment of ₹25,000 received via UPI (UTR9384729184)',
    description: 'Human-readable description of what occurred',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    example: { amount: 25000, method: 'upi', reference: 'UTR9384729184' },
    description: 'Machine-readable structured event metadata',
  })
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne('Invoice', 'events', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice?: Invoice;
}

