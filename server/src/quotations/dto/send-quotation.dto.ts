import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class SendQuotationDto {
  @ApiPropertyOptional({
    example: 'john@acme.com',
    description: 'Direct email address to send quotation link to',
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
    example: 'Here is the quotation for your website redesign project.',
    description: 'Optional personal message to accompany quotation link',
  })
  @IsOptional()
  @IsString()
  message?: string;
}
