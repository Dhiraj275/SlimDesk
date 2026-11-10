import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { PaymentProfileType } from '../enums/payment-profile-type.enum.js';

export class CreatePaymentProfileDto {
  @ApiProperty({
    example: 'HDFC Current Account',
    description: 'Friendly label for this payout profile',
  })
  @IsString()
  @IsNotEmpty()
  profileName: string;

  @ApiProperty({
    enum: PaymentProfileType,
    example: PaymentProfileType.BANK_TRANSFER,
  })
  @IsEnum(PaymentProfileType)
  type: PaymentProfileType;

  @ApiPropertyOptional({ example: 'INR', default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({
    example: {
      bankName: 'HDFC Bank',
      accountNumber: '50100012345678',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Slimdesk Studio',
    },
    description: 'Structured configuration details for payout',
  })
  @IsObject()
  details: Record<string, any>;

  @ApiPropertyOptional({
    example: 'Please include your Invoice number in the transfer remarks.',
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class UpdatePaymentProfileDto {
  @ApiPropertyOptional({ example: 'HDFC Bank Account' })
  @IsOptional()
  @IsString()
  profileName?: string;

  @ApiPropertyOptional({ enum: PaymentProfileType })
  @IsOptional()
  @IsEnum(PaymentProfileType)
  type?: PaymentProfileType;

  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

