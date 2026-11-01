import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus } from '../enums/lead-status.enum.js';

export class UpdateLeadStatusDto {
  @ApiProperty({
    example: LeadStatus.QUALIFIED,
    enum: LeadStatus,
    description: 'Updated pipeline status for the lead',
  })
  @IsNotEmpty()
  @IsEnum(LeadStatus)
  status: LeadStatus;

  @ApiPropertyOptional({
    example: 'Client selected an in-house team member due to internal budget restructuring.',
    description: 'Reason for marking lead as lost (recommended when status is lost)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lostReason?: string;

  @ApiPropertyOptional({
    example: 'Client verified budget of $25,000 and needs delivery within 6 weeks.',
    description: 'Optional note describing why the status was changed',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
