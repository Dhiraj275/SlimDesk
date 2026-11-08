import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  Min,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum.js';

export class RecordPaymentDto {
  @ApiProperty({
    example: 25000.0,
    description: 'Payment amount received (must be positive and not exceed outstanding balance)',
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.UPI,
    description: 'Payment method (cash, bank_transfer, upi, other)',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    example: '2026-11-08',
    description: 'Date payment was received (YYYY-MM-DD)',
  })
  @IsString()
  @IsNotEmpty()
  paymentDate: string;

  @ApiPropertyOptional({
    example: 'UTR9384729184',
    description: 'Bank reference number, UTR, or transaction receipt code',
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({
    example: 'Client paid first installment via PhonePe UPI',
    description: 'Payment notes or remarks',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

