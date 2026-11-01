import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadFollowUpDto {
  @ApiProperty({
    example: '2026-11-05T15:00:00.000Z',
    description: 'Scheduled due date/time for the follow-up',
  })
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({
    example: 'Client wanted to discuss the quotation with their business partner before confirming.',
    description: 'Context notes for this follow-up',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
