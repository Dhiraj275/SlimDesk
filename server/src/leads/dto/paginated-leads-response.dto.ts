import { ApiProperty } from '@nestjs/swagger';
import { Lead } from '../entities/lead.entity.js';

export class PaginatedLeadsResponseDto {
  @ApiProperty({
    type: () => [Lead],
    description: 'Array of leads matching the filter and pagination criteria',
  })
  items: Lead[];

  @ApiProperty({
    example: 24,
    description: 'Total number of leads matching query filters',
  })
  total: number;
}
