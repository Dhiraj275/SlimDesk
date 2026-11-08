import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class RecordRefundDto {
  @ApiProperty({
    example: 'e91fb183-209e-4c74-9f43-a618f0296ee8',
    description: 'Payment record UUID to be marked as refunded',
  })
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({
    example: 'Customer requested refund due to duplicate transfer error',
    description: 'Reason for issuing the refund',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

