import { ApiProperty } from '@nestjs/swagger';

export class LeadMetricsDto {
  @ApiProperty({
    example: 24,
    description: 'Total number of captured leads across all stages',
  })
  totalLeads: number;

  @ApiProperty({
    example: 8,
    description: 'Number of active leads in progress (excluding converted and lost)',
  })
  inProgressCount: number;

  @ApiProperty({
    example: 3,
    description: 'Number of active leads with follow-ups due today or overdue',
  })
  followUpsDueCount: number;

  @ApiProperty({
    example: 5,
    description: 'Number of leads successfully converted into clients',
  })
  convertedCount: number;
}
