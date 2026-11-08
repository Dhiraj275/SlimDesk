import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CancelInvoiceDto {
  @ApiProperty({
    example: 'Client decided to postpone the project engagement',
    description: 'Reason for voiding/cancelling the invoice',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

