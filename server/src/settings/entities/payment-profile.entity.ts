import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProfileType } from '../enums/payment-profile-type.enum.js';

@Entity('payment_profiles')
export class PaymentProfile {
  @ApiProperty({
    example: 'a1f908e7-b2b6-43aa-abba-bc072ad8b59b',
    description: 'Unique payment profile UUID',
  })
  @PrimaryGeneratedColumn('uuid')
  paymentProfileId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Owner user UUID',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiProperty({
    example: 'HDFC Current Account',
    description: 'Friendly name of the payment profile',
  })
  @Column({ type: 'varchar', length: 100 })
  profileName: string;

  @ApiProperty({
    enum: PaymentProfileType,
    example: PaymentProfileType.BANK_TRANSFER,
    description: 'Category of payment profile (bank_transfer, upi, international, other)',
  })
  @Column({
    type: 'enum',
    enum: PaymentProfileType,
    default: PaymentProfileType.BANK_TRANSFER,
  })
  type: PaymentProfileType;

  @ApiProperty({
    example: 'INR',
    description: 'Primary currency for this payment destination',
  })
  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @ApiProperty({
    example: true,
    description: 'Whether this payment profile is used by default on new documents',
  })
  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @ApiProperty({
    example: {
      bankName: 'HDFC Bank',
      accountNumber: '50100012345678',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Slimdesk Studio LLP',
      branch: 'Nariman Point, Mumbai',
    },
    description: 'Structured configuration details for payout (bank, upi, or international wire)',
  })
  @Column({ type: 'json' })
  details: Record<string, any>;

  @ApiPropertyOptional({
    example: 'Please mention your Invoice Number in the transfer remarks.',
    description: 'Custom instructions displayed to the client on invoice payment section',
  })
  @Column({ type: 'text', nullable: true })
  instructions: string | null;

  @ApiProperty({
    example: true,
    description: 'Whether this profile is available for selection in documents',
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

