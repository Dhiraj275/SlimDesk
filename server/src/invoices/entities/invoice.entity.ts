import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '../enums/invoice-status.enum.js';
import { TaxMode } from '../../quotations/enums/tax-mode.enum.js';
import { InvoiceItem } from './invoice-item.entity.js';
import { InvoicePayment } from './invoice-payment.entity.js';
import { InvoiceEvent } from './invoice-event.entity.js';

@Entity('invoices')
@Unique('unique_user_invoice_number', ['userId', 'invoiceNumber'])
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
    example: 'baf908e7-a1a6-43aa-abba-bc072ad8b59b',
    description: 'Associated client contact UUID',
  })
  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  contactId: string | null;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Originating quotation UUID identifier (if converted from quotation)',
  })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 36, nullable: true })
  quotationId: string | null;

  @ApiProperty({
    example: 'INV-2026-001',
    description: 'Unique sequential human-readable invoice number',
  })
  @Index()
  @Column({ type: 'varchar', length: 50 })
  invoiceNumber: string;

  @ApiProperty({
    example: 'Website Redesign & Frontend Development',
    description: 'Invoice subject or project title',
  })
  @Column({ type: 'varchar', length: 255, default: 'Services Rendered' })
  title: string;

  @ApiProperty({
    enum: InvoiceStatus,
    example: InvoiceStatus.DRAFT,
    description: 'Invoice document lifecycle status (draft, issued, cancelled)',
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
    description: 'ISO currency code (default: INR)',
  })
  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @ApiProperty({
    example: '2026-11-08',
    description: 'Invoice issuance date (YYYY-MM-DD)',
  })
  @Column({ type: 'date' })
  issueDate: string;

  @ApiProperty({
    example: '2026-11-15',
    description: 'Payment due date deadline (YYYY-MM-DD)',
  })
  @Column({ type: 'date' })
  dueDate: string;

  @ApiProperty({
    example: 45000.0,
    description: 'Subtotal of line items before tax and overall discounts',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  subtotal: number;

  @ApiProperty({
    example: 0.0,
    description: 'Total discount amount applied',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  discountAmount: number;

  @ApiProperty({
    example: 8100.0,
    description: 'Total tax amount (0.00 if taxMode is none)',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  taxAmount: number;

  @ApiProperty({
    example: 53100.0,
    description: 'Grand total invoice amount requested',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  totalAmount: number;

  @ApiProperty({
    enum: TaxMode,
    example: TaxMode.NONE,
    description: 'Tax calculation mode (default: none for unregistered freelancers)',
  })
  @Column({
    type: 'enum',
    enum: TaxMode,
    default: TaxMode.NONE,
  })
  taxMode: TaxMode;

  @ApiPropertyOptional({
    example: {
      isInterState: false,
      cgstRate: 9,
      cgstAmount: 4050,
      sgstRate: 9,
      sgstAmount: 4050,
      igstRate: 0,
      igstAmount: 0,
      placeOfSupply: 'Maharashtra',
    },
    description: 'Detailed GST or tax breakdown if taxMode is gst or flat',
  })
  @Column({ type: 'json', nullable: true })
  taxDetails: Record<string, any> | null;

  @ApiProperty({
    example: {
      name: 'Freelancer Name',
      businessName: 'Slimdesk Freelancer Studio',
      email: 'hello@example.com',
      phone: '+91 98765 43210',
      address: 'Mumbai, India',
      gstin: '24XXXXXXXXXXXX',
      state: 'Maharashtra',
    },
    description: 'Snapshot of freelancer billing information',
  })
  @Column({ type: 'json' })
  freelancerInfo: Record<string, any>;

  @ApiProperty({
    example: {
      name: 'Acme Studio',
      company: 'Acme Studio LLC',
      email: 'client@example.com',
      phone: '+1 555 123 4567',
      address: '123 Tech Park',
      gstin: null,
      state: 'Maharashtra',
    },
    description: 'Snapshot of billed client information',
  })
  @Column({ type: 'json' })
  clientInfo: Record<string, any>;

  @ApiPropertyOptional({
    example: 'Bank: HDFC Bank | A/C: 50100012345678 | IFSC: HDFC0001234 | UPI: freelancer@upi',
    description: 'Bank transfer or UPI payment instructions',
  })
  @Column({ type: 'text', nullable: true })
  paymentDetails: string | null;

  @ApiPropertyOptional({
    example: 'Payment due within 7 days of invoice issuance. Late fee of 1.5% per month applies.',
    description: 'Payment terms and conditions',
  })
  @Column({ type: 'text', nullable: true })
  terms: string | null;

  @ApiPropertyOptional({
    example: 'Thank you for your business!',
    description: 'Additional notes or remarks to client',
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    example: '9c8e7769-7425-40de-944b-e07fc1f90bc8',
    description: 'Unguessable public token for client portal access',
  })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  publicToken: string;

  @ApiPropertyOptional({
    example: '2026-11-08T10:30:00Z',
    description: 'Timestamp when client first viewed the invoice link',
  })
  @Column({ type: 'timestamp', nullable: true })
  viewedAt: Date | null;

  @ApiPropertyOptional({
    example: '2026-11-08T09:00:00Z',
    description: 'Timestamp when invoice was officially issued/finalized',
  })
  @Column({ type: 'timestamp', nullable: true })
  issuedAt: Date | null;

  @ApiPropertyOptional({
    example: '2026-11-08T12:00:00Z',
    description: 'Timestamp when invoice was cancelled',
  })
  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @ApiPropertyOptional({
    example: 'Client cancelled contract before work started',
    description: 'Reason for invoice cancellation',
  })
  @Column({ type: 'text', nullable: true })
  cancelReason: string | null;

  @ApiPropertyOptional({
    example: '2026-11-12T14:00:00Z',
    description: 'Timestamp of the most recent payment reminder sent',
  })
  @Column({ type: 'timestamp', nullable: true })
  lastRemindedAt: Date | null;

  @ApiProperty({
    example: 0,
    description: 'Number of payment reminders sent to the client',
  })
  @Column({ type: 'int', default: 0 })
  reminderCount: number;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    cascade: true,
  })
  items: InvoiceItem[];

  @OneToMany(() => InvoicePayment, (payment) => payment.invoice, {
    cascade: true,
  })
  payments: InvoicePayment[];

  @OneToMany(() => InvoiceEvent, (event) => event.invoice, {
    cascade: true,
  })
  events: InvoiceEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

