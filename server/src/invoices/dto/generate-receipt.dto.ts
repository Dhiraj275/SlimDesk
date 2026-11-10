import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateReceiptDto {
  @ApiPropertyOptional({
    example: 'Payment received with thanks.',
    description: 'Custom acknowledgement notes printed on the payment receipt',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

