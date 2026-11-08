import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class SendReminderDto {
  @ApiPropertyOptional({
    example: 'client@acme.com',
    description: 'Direct email address to send reminder to',
  })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @ApiPropertyOptional({
    example: 'Hi, this is a friendly reminder that invoice INV-2026-001 has an outstanding balance of ₹28,100. Please let me know if you need any clarification.',
    description: 'Customized reminder message',
  })
  @IsOptional()
  @IsString()
  message?: string;
}

