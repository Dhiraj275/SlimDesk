import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class SendInvoiceDto {
  @ApiPropertyOptional({
    example: 'client@acme.com',
    description: 'Direct email address to send invoice link to',
  })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Name of the recipient',
  })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({
    example: 'Please find attached invoice INV-2026-001 for website development services.',
    description: 'Personalized message accompanying the invoice link',
  })
  @IsOptional()
  @IsString()
  message?: string;
}

