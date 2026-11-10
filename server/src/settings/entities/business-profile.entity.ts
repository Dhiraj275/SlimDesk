import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaxMode } from '../../quotations/enums/tax-mode.enum.js';
import { DocumentTemplate } from '../enums/document-template.enum.js';

@Entity('business_profiles')
export class BusinessProfile {
  @ApiProperty({
    example: 'b1f908e7-a1a6-43aa-abba-bc072ad8b59b',
    description: 'Unique business profile UUID',
  })
  @PrimaryGeneratedColumn('uuid')
  profileId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Owner user UUID',
  })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiProperty({
    example: 'Slimdesk Studio',
    description: 'Commercial brand or business name',
  })
  @Column({ type: 'varchar', length: 150, default: 'My Freelance Studio' })
  businessName: string;

  @ApiPropertyOptional({
    example: 'Slimdesk Studio Private Limited',
    description: 'Registered legal entity name',
  })
  @Column({ type: 'varchar', length: 150, nullable: true })
  legalName: string | null;

  @ApiPropertyOptional({
    example: 'hello@slimdesk.studio',
    description: 'Primary business email address',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @ApiPropertyOptional({
    example: '+91 98765 43210',
    description: 'Primary business contact number',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @ApiPropertyOptional({
    example: '402, High Street Towers, Senapati Bapat Marg',
    description: 'Street address line',
  })
  @Column({ type: 'text', nullable: true })
  address: string | null;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @ApiPropertyOptional({ example: '400013' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode: string | null;

  @ApiProperty({ example: 'India' })
  @Column({ type: 'varchar', length: 100, default: 'India' })
  country: string;

  @ApiPropertyOptional({ example: 'https://slimdesk.studio' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @ApiPropertyOptional({
    example: 'https://assets.slimdesk.studio/logos/my-brand.png',
    description: 'Brand logo image URL for documents',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @ApiPropertyOptional({
    example: 'https://assets.slimdesk.studio/signatures/dhiraj.png',
    description: 'Visual signature asset URL',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  signatureUrl: string | null;

  @ApiProperty({
    example: '#4f46e5',
    description: 'Primary accent color for document templates',
  })
  @Column({ type: 'varchar', length: 20, default: '#0f172a' })
  brandColor: string;

  @ApiPropertyOptional({
    example: '27AAAAA0000A1Z5',
    description: 'Goods and Services Tax Identification Number (India)',
  })
  @Column({ type: 'varchar', length: 25, nullable: true })
  gstin: string | null;

  @ApiProperty({
    enum: TaxMode,
    example: TaxMode.NONE,
    description: 'Default tax calculation mode for new documents (none, gst, flat)',
  })
  @Column({
    type: 'enum',
    enum: TaxMode,
    default: TaxMode.NONE,
  })
  taxMode: TaxMode;

  @ApiProperty({
    example: 0.0,
    description: 'Default tax percentage applied if tax mode is active',
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  defaultTaxRate: number;

  @ApiProperty({
    example: 'INR',
    description: 'Default currency code (INR, USD, EUR, etc.)',
  })
  @Column({ type: 'varchar', length: 10, default: 'INR' })
  defaultCurrency: string;

  @ApiProperty({
    example: 'dd MMM yyyy',
    description: 'Display date format for generated documents',
  })
  @Column({ type: 'varchar', length: 30, default: 'dd MMM yyyy' })
  dateFormat: string;

  @ApiProperty({
    example: 14,
    description: 'Default payment due deadline in days from issue date',
  })
  @Column({ type: 'int', default: 14 })
  dueDaysPreset: number;

  @ApiProperty({
    enum: DocumentTemplate,
    example: DocumentTemplate.MODERN,
    description: 'Default visual template layout style for documents',
  })
  @Column({
    type: 'enum',
    enum: DocumentTemplate,
    default: DocumentTemplate.MODERN,
  })
  documentTemplate: DocumentTemplate;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

