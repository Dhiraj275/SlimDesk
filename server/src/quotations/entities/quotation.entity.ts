import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuotationStatus } from '../enums/quotation-status.enum.js';
import { TaxMode } from '../enums/tax-mode.enum.js';
import { QuotationItem } from './quotation-item.entity.js';
import { QuotationVersion } from './quotation-version.entity.js';

@Entity('quotations')
export class Quotation {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Unique quotation UUID identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  quotationId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Freelancer user UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiPropertyOptional({
    example: 'baf908e7-a1a6-43aa-abba-bc072ad8b59b',
    description: 'Associated contact UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  contactId: string | null;

  @ApiPropertyOptional({
    example: 'f13d3aba-edd3-464f-9e4e-2e9532b61966',
    description: 'Associated lead UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  leadId: string | null;

  @ApiProperty({
    example: 'QT-2026-001',
    description: 'Unique sequential human-readable quotation number',
  })
  @Index()
  @Column({ type: 'varchar', length: 50 })
  quotationNumber: string;

  @ApiProperty({
    example: 'Website Redesign & Frontend Development',
    description: 'Quotation title / project subject',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    example: 1,
    description: 'Active revision version number',
  })
  @Column({ type: 'int', default: 1 })
  version: number;

  @ApiProperty({
    enum: QuotationStatus,
    example: QuotationStatus.DRAFT,
    description: 'Current status in lifecycle',
  })
  @Index()
  @Column({
    type: 'enum',
    enum: QuotationStatus,
    default: QuotationStatus.DRAFT,
  })
  status: QuotationStatus;

  @ApiProperty({
    example: 'INR',
    description: 'ISO currency code',
  })
  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @ApiProperty({
    example: '2026-11-06',
    description: 'Quotation issue date (YYYY-MM-DD)',
  })
  @Column({ type: 'date' })
  issueDate: string;

  @ApiProperty({
    example: '2026-11-20',
    description: 'Quotation expiration / validity date (YYYY-MM-DD)',
  })
  @Column({ type: 'date' })
  expiryDate: string;

  @ApiProperty({
    example: 45000.0,
    description: 'Subtotal of line items before tax and overall discounts',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  subtotal: number;

  @ApiProperty({
    example: 0.0,
    description: 'Total discount amount applied',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  discountAmount: number;

  @ApiProperty({
    example: 0.0,
    description: 'Total tax amount (0.00 if taxMode is none)',
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
    description: 'Decomposed tax details when taxMode is gst or flat',
  })
  @Column({ type: 'json', nullable: true })
  taxDetails: Record<string, any> | null;

  @ApiProperty({
    example: {
      name: 'Dhiraj Freelancer',
      businessName: 'Studio Freelance',
      email: 'hello@freelancer.com',
      phone: '+91 98765 43210',
      address: 'Mumbai, India',
      gstin: null,
      state: 'Maharashtra',
    },
    description: 'Snapshot of freelancer / studio business details at quotation time',
  })
  @Column({ type: 'json' })
  freelancerInfo: Record<string, any>;

  @ApiProperty({
    example: {
      name: 'John Doe',
      company: 'Acme Studio',
      email: 'john@acme.com',
      phone: '+1 555 123 4567',
      address: '123 Tech Park',
      gstin: null,
      state: 'Maharashtra',
    },
    description: 'Snapshot of client contact details at quotation time',
  })
  @Column({ type: 'json' })
  clientInfo: Record<string, any>;

  @ApiPropertyOptional({
    example: '50% advance on approval, 50% upon final delivery',
    description: 'Milestone or installment payment schedule details',
  })
  @Column({ type: 'text', nullable: true })
  paymentSchedule: string | null;

  @ApiPropertyOptional({
    example: 'Valid for 14 days. Work commences upon receipt of initial deposit.',
    description: 'Terms and conditions',
  })
  @Column({ type: 'text', nullable: true })
  terms: string | null;

  @ApiPropertyOptional({
    example: 'Looking forward to working together on this project.',
    description: 'Personal notes or comments to client',
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    description: 'Unguessable public token for client portal access',
  })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  publicToken: string;

  @ApiPropertyOptional({
    example: '2026-11-06T10:30:00Z',
    description: 'Timestamp when client first viewed public link',
  })
  @Column({ type: 'timestamp', nullable: true })
  viewedAt: Date | null;

  @ApiPropertyOptional({
    example: '2026-11-06T14:20:00Z',
    description: 'Timestamp when client approved quotation',
  })
  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date | null;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Name of the contact who approved quotation',
  })
  @Column({ type: 'varchar', length: 150, nullable: true })
  acceptedByName: string | null;

  @ApiPropertyOptional({
    example: 'john@acme.com',
    description: 'Email of the contact who approved quotation',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  acceptedByEmail: string | null;

  @ApiPropertyOptional({
    example: '2026-11-06T14:20:00Z',
    description: 'Timestamp when client declined quotation',
  })
  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date | null;

  @ApiPropertyOptional({
    example: 'Budget exceeded our current Q4 allocation',
    description: 'Client feedback reason upon declining',
  })
  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @ApiPropertyOptional({
    example: '2026-11-06T16:00:00Z',
    description: 'Timestamp when quotation was converted to invoice',
  })
  @Column({ type: 'timestamp', nullable: true })
  convertedAt: Date | null;

  @ApiPropertyOptional({
    example: '9f8e7d6c-5b4a-3210-fedc-ba9876543210',
    description: 'Generated Invoice UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  invoiceId: string | null;

  @OneToMany(() => QuotationItem, (item) => item.quotation, {
    cascade: true,
  })
  items: QuotationItem[];

  @OneToMany(() => QuotationVersion, (version) => version.quotation, {
    cascade: true,
  })
  versions: QuotationVersion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
